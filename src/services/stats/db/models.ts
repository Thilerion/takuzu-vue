import { dimensionsToBoardType, type BoardType } from "@/config";
import type { BasicPuzzleConfig, BoardShape } from "@/lib/types.js";
import { formatYYYYMMDD } from "@/utils/date.utils.js";
import type { DifficultyKey } from "@/lib/types.js";
import type { SimpleBoard } from "@/lib/index.js";

export type DbHistoryEntryData = BasicPuzzleConfig & {
	initialBoard: string,
	solution: string,
	timeElapsed: number,
	timestamp: number,
	localDateStr: string,
	flags: DbHistoryEntryFlags,
	id?: number,
	note?: string
}
export type DbHistoryEntryFlags = {
	cheatsUsed?: boolean | number,
	favorite?: boolean | number,
};

export type FinishedPuzzleState = Omit<DbHistoryEntry, 'initialBoard' | 'solution' | 'timestamp' | 'localDateStr' | 'flags'> & {
	initialBoard: SimpleBoard,
	solution: SimpleBoard,
	assistance: {
		cheatsUsed: boolean,
	},
	date?: Date,
	timestamp?: number,
	localDateStr?: string,
	flags?: DbHistoryEntryFlags,
}

export class DbHistoryEntry {
	width: number;
	height: number;
	difficulty: DifficultyKey;
	timeElapsed: number;
	flags: DbHistoryEntryFlags;
	initialBoard: string;
	solution: string;
	timestamp: number;
	localDateStr: string;
	id?: number;
	note?: string;

	constructor(data: DbHistoryEntryData | Record<string, any>) {

		validateKeys(data);

		const {
			width, height, difficulty,
			initialBoard, solution,
			timeElapsed,

			timestamp, localDateStr,
			flags = {},
			id,
			note
		} = data;

		this.width = width;
		this.height = height;
		this.difficulty = difficulty;

		this.initialBoard = initialBoard;
		this.solution = solution;

		this.timeElapsed = timeElapsed;

		this.timestamp = timestamp;
		this.localDateStr = localDateStr;

		this.flags = { ...flags };
		if (note != null) {
			this.note = note;
		}
		
		if (id !== undefined) {
			this.id = id;
		}
	}

	static fromPuzzleState(puzzleState: FinishedPuzzleState) {
		if (puzzleState == null) {
			throw new Error('Invalid puzzleState; cannot turn this into a DbHistoryEntry entry');
		}

		const initialBoard = puzzleState.initialBoard.toBoardString();
		const solution = puzzleState.solution.toBoardString();
		const flags = puzzleState.flags ?? {};

		if (puzzleState.assistance.cheatsUsed) {
			flags.cheatsUsed = true;
		}
		
		const t = puzzleState.timestamp || puzzleState.date;
		const timestamp = t != null ? new Date(t).valueOf() : Date.now();
		const localDateStr = puzzleState.localDateStr ?? formatYYYYMMDD(timestamp);
		
		return new DbHistoryEntry({
			...puzzleState,
			initialBoard,
			solution,
			flags,
			timestamp,
			localDateStr
		})
	}
}


export class PuzzleStatisticData extends DbHistoryEntry {
	boardType: BoardType;
	date: Date;
	dimensions: string;
	puzzleConfigKey: string;
	numCells: number;
	timePer100: number;

	constructor(data: DbHistoryEntryData | Record<string, any>) {
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

	get timeElapsedAdjusted(): number {
		console.warn('GET: TimeElapsedAdjusted is deprecated. Use timePer100 instead.');
		return this.timePer100;
	}
}

function validateKeys(data: Record<string, any> | null | undefined): asserts data is DbHistoryEntryData {
	if (!data) {
		throw new Error('Data for history entry must be an object.');
	}
	if (typeof data !== 'object') {
		throw new Error('Data for history entry must be an object.');
	}
	if (!isNumber(data.width) || !isNumber(data.height) || !isNumber(data.difficulty)) {
		throw new Error('Width/height/difficulty must be numbers.');
	}
	if (!isString(data.initialBoard) || !isString(data.solution)) {
		throw new Error('InitialBoard and solution must be strings.');
	}
	if (!isNumber(data.timeElapsed)) {
		throw new Error('Invalid value for Time elapsed.');
	}
	if (!isNumber(data.timestamp)) {
		throw new Error('Invalid value for timestamp.');
	}
	if (!isString(data.localDateStr)) {
		throw new Error('LocalDateStr must be a string.');
	}
}

function isNumber(value: unknown): value is number {
	return value != null && typeof value === 'number' && !Number.isNaN(value);
}
function isString(value: unknown): value is string {
	return typeof value === 'string' || value instanceof String;
}