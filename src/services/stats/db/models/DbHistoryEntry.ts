import type { SimpleBoard } from "@/lib";
import type { BoardString, DifficultyKey } from "@/lib/types";
import { formatYYYYMMDD } from "@/utils/date.utils.js";

interface EntryFlags {
	favorite?: boolean | 1 | 0;
	cheatsUsed?: boolean | 1 | 0;
}
export interface EntryData {
	width: number;
	height: number;
	difficulty: DifficultyKey;
	initialBoard: BoardString;
	solution: BoardString;
	timeElapsed: number;
	timestamp: number;
	localDateStr: string;

	flags?: EntryFlags;
	id?: number;
	note?: string;
}
export type PuzzleStateData = Omit<EntryData, 'initialBoard' | 'solution' | 'localDateStr'> & { timestamp?: number, date?: number, localDateStr?: string, assistance?: { cheatsUsed?: boolean } } & { initialBoard: SimpleBoard, solution: SimpleBoard };

export class DbHistoryEntry {
	width: number;
	height: number;
	difficulty: DifficultyKey;

	initialBoard: BoardString;
	solution: BoardString;

	timeElapsed: number;
	timestamp: number;
	localDateStr: string;

	flags: EntryFlags;
	id?: number;
	note?: string;

	constructor(data: EntryData) {
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

	// uses puzzleState from the store after a puzzle is completed
	static fromPuzzleState(puzzleState: PuzzleStateData) {
		if (puzzleState == null) {
			throw new Error('Invalid puzzleState; cannot turn this into a DbHistoryEntry entry');
		}
		const initialBoard = puzzleState.initialBoard.toBoardString();
		const solution = puzzleState.solution.toBoardString();
		const flags = puzzleState.flags ?? {};
		if (puzzleState?.assistance?.cheatsUsed) {
			flags.cheatsUsed = true;
		}
		const t: number | undefined = puzzleState.timestamp || puzzleState.date;
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

function validateKeys(data: Record<any, any>): asserts data is EntryData {
	if (!data) {
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

function isNumber(value?: string | number | null): value is number {
	return value != null && Math.floor(value as number) === value;
}
function isString(value: unknown): value is string {
	return typeof value === 'string' || value instanceof String;
}