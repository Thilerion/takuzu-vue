import { COLUMN, ROW, type LineType, type PuzzleValue } from "../constants";
import type { Vec } from "../types";
import type { SimpleBoard } from "./Board";

export type ThreesCoords = [Vec, Vec, Vec];
export type ThreesValues = [PuzzleValue, PuzzleValue, PuzzleValue];

export class ThreesUnit {
	id: string;
	coords: ThreesCoords;
	private _values: null | ThreesValues = null;
	constructor(
		public x: number,
		public y: number,
		public type: LineType,
		private _board: SimpleBoard
	) {
		this.id = `${type === ROW ? 'h' : 'v'}-${x},${y}`;
		this.coords = [
			this.getCoords(0),
			this.getCoords(1),
			this.getCoords(2),
		];
	}

	get values() {
		if (this._values == null) {
			this._values = this.coords.map(({ x, y }) => {
				return this._board.get(x, y);
			}) as ThreesValues;
			return this._values;
		}
		return this._values;
	}

	toString() {
		return this.values.join('');
	}

	getCoords(i: 0 | 1 | 2) {
		const coord: Vec = { x: this.x, y: this.y };
		if (this.type === ROW) coord.x += i;
		else if (this.type === COLUMN) coord.y += i;
		return coord;
	}
	getAllCoords(): ThreesCoords {
		return this.coords.map(c => ({ ...c })) as ThreesCoords;
	}
}