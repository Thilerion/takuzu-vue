import { COLUMN, ROW, type LineType, type PuzzleValue } from "../constants";
import type { Vec } from "../types";
import { isPuzzleValue } from "../utils/puzzle-value.utils";
import type { SimpleBoard } from "./Board";

export type ThreesCoords = [Vec, Vec, Vec];
export type ThreesValues = [PuzzleValue, PuzzleValue, PuzzleValue];
export type ThreesUnitDir = 'h' | 'v';

export class ThreesUnit {
	id: string;
	coords: ThreesCoords;

	x: number;
	y: number;
	type: LineType;

	private _board: SimpleBoard | null;
	private _values: ThreesValues | null;

	static dirFromLineType(type: LineType): ThreesUnitDir {
		return type === 'row' ? 'h' : 'v';
	}
	static createId(x: number, y: number, type: LineType) {
		return `${this.dirFromLineType(type)}-${x},${y}`;
	}

	constructor(
		x: number,
		y: number,
		type: LineType,
		boardOrValues: SimpleBoard | ThreesValues
	) {
		this.id = ThreesUnit.createId(x, y, type);
		
		this.x = x;
		this.y = y;
		this.type = type;

		this.coords = [
			this.getCoords(0),
			this.getCoords(1),
			this.getCoords(2),
		];

		if (Array.isArray(boardOrValues)) {
			this._values = boardOrValues;
			this._board = null;
		} else {
			this._board = boardOrValues;
			this._values = null;
		}
	}

	static isThreesValues(vals: unknown[]): vals is ThreesValues {
		return vals.length === 3 && vals.every(v => isPuzzleValue(v));
	}

	get values() {
		if (this._values == null) {
			this._values = this.coords.map(({ x, y }) => {
				return this._board!.get(x, y);
			}) as ThreesValues;
		}
		return this._values;
	}

	getCoords(i: 0 | 1 | 2) {
		const coord: Vec = { x: this.x, y: this.y };
		if (this.type === ROW) coord.x += i;
		else if (this.type === COLUMN) coord.y += i;
		return coord;
	}
}