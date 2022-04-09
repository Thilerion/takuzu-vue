import { dimensionsToBoardType } from "@/config.js";
import { formatYYYYMMDD } from "@/utils/date.utils.js";

export class DbHistoryEntry {
	constructor(data) {

		validateKeys(data);

		const {
			width, height, difficulty,
			initialBoard, solution,
			timeElapsed,

			timestamp, localDateStr,
			flags = {},
			id
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
		
		if (id !== undefined) {
			this.id = id;
		}
	}

	static fromPuzzleState(puzzleState) {
		if (puzzleState == null) {
			throw new Error('Invalid puzzleState; cannot turn this into a DbHistoryEntry entry');
		}

		const initialBoard = puzzleState.initialBoard.toBoardString();
		const solution = puzzleState.solution.toBoardString();
		const flags = puzzleState.flags ?? {};
		
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
	constructor(data) {
		super(data);

		this.boardType = dimensionsToBoardType(this.width, this.height);
		
		this._dateMs = this.timestamp;
		this.date = new Date(this.timestamp);
		
		this._dateStr = this.localDateStr ?? formatYYYYMMDD(this.timestamp);

		this.dimensions = `${this.width}x${this.height}`;
		this.dimensionDifficultyStr = `${this.dimensions}-${this.difficulty}`;
		this.numCells = this.width * this.height;
		
		this.timeElapsedAdjusted = this.calculateAdjustedTimeElapsed();
	}

	get dateStr() {
		// console.log('DateStr is deprecated. Use localDateStr instead.');
		return this._dateStr;
	}
	set dateStr(val) {
		this._dateStr = val;
	}
	get dateMs() {
		// console.log('dateMs is deprecated. Use timestamp instead.');
		return this._dateMs;
	}
	set dateMs(val) {
		this._dateMs = val;
	}

	calculateAdjustedTimeElapsed(fromBase = 100) {
		const numCells = this.width * this.height;
		const ratio = numCells / fromBase;
		return Math.round(this.timeElapsed / ratio);
	}
}

function validateKeys(data) {
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
	return true;
}

function isNumber(value) {
	return value != null && Math.floor(value) === value;
}
function isString(value) {
	return typeof value === 'string' || value instanceof String;
}