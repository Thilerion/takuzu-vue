import type { PuzzleValue } from "@/lib/constants.js";
import type { Vec } from "@/lib/types.js";

export type IHistoryMoveSingle = Vec & {
	value: PuzzleValue;
	prevValue: PuzzleValue;
	type: 'single'
}
export class HistoryMoveSingle implements IHistoryMoveSingle {
	x: number;
	y: number;
	value: PuzzleValue;
	prevValue: PuzzleValue;
	type = 'single' as const;

	constructor(x: number, y: number, value: PuzzleValue, prevValue: PuzzleValue) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.prevValue = prevValue;
	}

	sameCell(other: Vec) {
		return this.x === other.x && this.y === other.y;
	}
	withNextValue(nextValue: PuzzleValue) {
		// combines with a different value, while keeping the same initial value. Useful when cell is toggled, then toggled again.
		return new HistoryMoveSingle(this.x, this.y, nextValue, this.prevValue);
	}
	hasValueChange() {
		return this.value !== this.prevValue;
	}

	isOriginalValueWithChange(value: PuzzleValue) {
		return this.prevValue === value;
	}

	export(): MoveSingleExport {
		return `${this.x},${this.y},${this.value},${this.prevValue}`;
	}
	static fromString(str: MoveSingleExport) {
		const split = str.split(',');
		const x = parseInt(split[0]);
		const y = parseInt(split[1]);
		const value = split[2] as PuzzleValue;
		const prevValue = split[3] as PuzzleValue;
		return new HistoryMoveSingle(x, y, value, prevValue);
	}

	toJSON(): IHistoryMoveSingle {
		return {
			...this,
		}
	}
}

export type IHistoryMove = IHistoryMoveSingle;
export type HistoryMove = HistoryMoveSingle;

export type MoveSingleExport = `${number},${number},${PuzzleValue},${PuzzleValue}`;
export type MoveExport = MoveSingleExport;