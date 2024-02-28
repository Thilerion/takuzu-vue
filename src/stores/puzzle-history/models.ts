import type { PuzzleValue } from "@/lib/constants.js";
import type { Vec } from "@/lib/types.js";

export type IHistoryMoveSingle = Vec & {
	to: PuzzleValue;
	from: PuzzleValue;
	type: 'single'
}
export class HistoryMoveSingle implements IHistoryMoveSingle {
	x: number;
	y: number;
	to: PuzzleValue;
	from: PuzzleValue;
	type = 'single' as const;

	constructor(x: number, y: number, to: PuzzleValue, from: PuzzleValue) {
		this.x = x;
		this.y = y;
		this.to = to;
		this.from = from;
	}

	getReverse() {
		return {
			x: this.x,
			y: this.y,
			to: this.from,
			from: this.to,
		}
	}

	sameCell(other: Vec) {
		return this.x === other.x && this.y === other.y;
	}
	withNextValue(nextValue: PuzzleValue) {
		// combines with a different value, while keeping the same initial value. Useful when cell is toggled, then toggled again.
		return new HistoryMoveSingle(this.x, this.y, nextValue, this.from);
	}
	hasValueChange() {
		return this.to !== this.from;
	}

	isOriginalValueWithChange(value: PuzzleValue) {
		return this.from === value;
	}

	export(): MoveSingleExport {
		return `${this.x},${this.y},${this.to},${this.from}`;
	}
	static fromString(str: MoveSingleExport) {
		const [xStr, yStr, to, from] = str.split(',');

		const x = parseInt(xStr);
		const y = parseInt(yStr);
		return new HistoryMoveSingle(x, y, to as PuzzleValue, from as PuzzleValue);
	}

	toData(): IHistoryMoveSingle {
		return {
			...this,
		}
	}
	toJSON() {
		return JSON.stringify(this.toData());
	}
}

export type IHistoryMove = IHistoryMoveSingle | IHistoryMoveSingle[];
export type HistoryMove = HistoryMoveSingle | HistoryMoveSingle[];

export type MoveSingleExport = `${number},${number},${PuzzleValue},${PuzzleValue}`;
export type MoveExport = MoveSingleExport | MoveSingleExport[];