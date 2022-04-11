import { formatBasicSortableDateKey } from "@/utils/date.utils.js";
import { dimensionsToBoardType } from "@/config.js";
import { DbHistoryEntry as HistoryDbEntry } from "./DbHistoryEntry.js";

export { HistoryDbEntry };

export class PuzzleStatisticData extends HistoryDbEntry {
	constructor(data) {
		console.warn('This class is deprecated; use the new version in stats2/db/models');
		super(data);

		this.boardType = dimensionsToBoardType(this.width, this.height);
		
		this._dateMs = this.timestamp;
		this.date = new Date(this.timestamp);
		
		this._dateStr = this.localDateStr ?? formatBasicSortableDateKey(this.date);

		this.dimensions = `${this.width}x${this.height}`;
		this.puzzleConfigKey = `${this.dimensions}-${this.difficulty}`;

		this.timePer100 = this.calculateAdjustedTimeElapsed(100);
	}

	get dateStr() {
		console.log('DateStr is deprecated. Use localDateStr instead.');
		return this._dateStr;
	}
	set dateStr(val) {
		this._dateStr = val;
	}
	get dateMs() {
		console.log('dateMs is deprecated. Use timestamp instead.');
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