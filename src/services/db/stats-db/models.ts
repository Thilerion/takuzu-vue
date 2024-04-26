import { dimensionsToBoardType, type BoardType } from "@/config.js";
import type { SimpleBoard } from "@/lib/board/Board.js";
import type { BasicPuzzleConfig, BoardString, DimensionStr, PuzzleConfigKey, InitialAndSolutionBoardStrings, InitialAndSolutionBoards, DifficultyKey } from "@/lib/types.js";
import { formatYYYYMMDD } from "@/utils/date.utils.js";

type WithTimeElapsed = {
	timeElapsed: number
}
type WithDbId = {
	id: number;
}
type MaybeDbId = {
	id?: number
}
export type FinishedPuzzleState = {
	assistance: {
		cheatsUsed: boolean
	}
} & BasicPuzzleConfig
	& InitialAndSolutionBoards
	& WithTimeElapsed
	& {
		timestamp?: number;
		date?: Date;
	};

type HistoryEntryFlags = {
	cheatsUsed?: boolean | 0 | 1,
	favorite?: boolean | 0 | 1,
}
type HistoryEntryData = BasicPuzzleConfig
	& InitialAndSolutionBoardStrings
	& WithTimeElapsed
	& MaybeDbId
	& {
		timestamp: number,
		localDateStr: string,
		flags?: HistoryEntryFlags,
		note?: string
	};

export type StatsDbHistoryEntryWithId = Omit<StatsDbHistoryEntry, 'id'> & WithDbId;

export class StatsDbHistoryEntry implements HistoryEntryData {
	width: number;
	height: number;
	difficulty: DifficultyKey;
	timeElapsed: number;
	flags: HistoryEntryFlags;
	initialBoard: BoardString;
	solution: BoardString;
	timestamp: number;
	localDateStr: string;
	id?: number;
	note?: string;

	constructor(data: HistoryEntryData) {
		const {
			width, height, difficulty,
			initialBoard, solution,
			timeElapsed,
			timestamp, localDateStr,
			flags = {},
		} = data;

		this.width = width;
		this.height = height;
		this.difficulty = difficulty;

		this.initialBoard = initialBoard;
		this.solution = solution;

		this.timeElapsed = timeElapsed;

		this.timestamp = timestamp;
		this.localDateStr = localDateStr;

		this.flags = flags;

		if (data.id != null) {
			this.id = data.id;
		}
		if (data.note != null) {
			this.note = data.note;
		}
	}

	isSavedToDb(): this is StatsDbHistoryEntryWithId {
		return this.id != null;
	}

	static fromPuzzleState(data: FinishedPuzzleState) {
		if (data == null) {
			throw new Error('Invalid finishedPuzzleState; cannot turn this into a StatsDbHistoryEntry');
		}

		const _initialBoard: SimpleBoard = data.initialBoard;
		const _solution: SimpleBoard = data.solution;
		const initialBoard: BoardString = _initialBoard.toBoardString();
		const solution: BoardString = _solution.toBoardString();

		const { width, height, difficulty, timeElapsed } = data;

		const timestamp = (data.timestamp ?? data.date?.valueOf()) ?? Date.now();
		const localDateStr = formatYYYYMMDD(timestamp);

		let flags: HistoryEntryFlags | undefined = undefined;
		const cheatsUsed = !!data.assistance.cheatsUsed;
		if (cheatsUsed) {
			flags = { cheatsUsed: true }
		}

		return new StatsDbHistoryEntry({
			...data,
			width, height, difficulty,
			initialBoard, solution,
			timeElapsed,
			timestamp, localDateStr,
			flags
		})
	}
}

// extends StatsDbHistoryEntry class with additional properties and methods useful for displaying stats
// TODO: extract this class to a Stats service or something, because it's not really a model used in the StatsDB
export class StatsDbExtendedStatisticDataEntry extends StatsDbHistoryEntry {
	date: Date;

	boardType: BoardType;
	dimensions: DimensionStr; /* | string */
	puzzleConfigKey: PuzzleConfigKey /* | string */;

	numCells: number;
	timePer100: number;

	constructor(data: HistoryEntryData) {
		super(data);

		this.boardType = dimensionsToBoardType(this.width, this.height);
		
		this.date = new Date(this.timestamp);
		
		this.dimensions = `${this.width}x${this.height}`;
		this.puzzleConfigKey = `${this.dimensions}-${this.difficulty}`;
		this.numCells = this.width * this.height;
		
		this.timePer100 = this.calculateAdjustedTimeElapsed(100);
	}

	calculateAdjustedTimeElapsed(fromBase = 100): number {
		const numCells = this.width * this.height;
		const ratio = numCells / fromBase;
		return Math.round(this.timeElapsed / ratio);
	}
}