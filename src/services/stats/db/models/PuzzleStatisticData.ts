import { type BoardType, dimensionsToBoardType } from "@/config";
import type { DimensionStr, PuzzleConfigKey } from "@/lib/types";
import { DbHistoryEntry, type EntryData } from "./DbHistoryEntry";


export class PuzzleStatisticData extends DbHistoryEntry {
	boardType: BoardType;
	date: Date;
	dimensions: DimensionStr;
	puzzleConfigKey: PuzzleConfigKey;
	numCells: number;
	timePer100: number;

	constructor(data: EntryData) {
		super(data);

		this.boardType = dimensionsToBoardType(this.width, this.height);
		this.date = new Date(this.timestamp);
		this.dimensions = `${this.width}x${this.height}`;
		this.puzzleConfigKey = `${this.dimensions}-${this.difficulty}`;
		this.numCells = this.width * this.height;
		this.timePer100 = calculateAdjustedTimeElapsed(this, 100);
	}
}

function calculateAdjustedTimeElapsed(data: PuzzleStatisticData, fromBase: number = 100) {
	const numCells = data.width * data.height;
	const ratio = numCells / fromBase;
	return Math.round(data.timeElapsed / ratio);
}