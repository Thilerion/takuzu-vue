import { COLUMN, EMPTY, ONE, ROW, ZERO, type LineType, type PuzzleSymbol, type PuzzleValue } from "../constants";
import { getValidLinePermutations, type LineArrSymbolPermutations } from "../permutations";
import type { LineId, PuzzleValueCount, PuzzleValueLine, ROPuzzleValueLine, Vec } from "../types";
import { columnIdToX, countLineValues, isLineIdRow, lineSizeToNumRequired, lineTypeFromLineId, rowIdToY } from "../utils";
import type { SimpleBoard } from "./Board";

export class BoardLine {
	type: LineType;
	index: number;

	private _values: null | PuzzleValueLine = null;
	private _coords: null | Vec[] = null;
	private _counts: null | PuzzleValueCount = null;
	private _numRequired: null | Record<PuzzleSymbol, number> = null;
	private _validPermutations: null | LineArrSymbolPermutations = null;
	private _least: null | number = null;
	private _most: null | number = null;

	constructor(
		private _board: SimpleBoard | null,
		public lineId: LineId
	) {
		this.type = lineTypeFromLineId(this.lineId);
		this.index = isLineIdRow(lineId) ? rowIdToY(lineId) : columnIdToX(lineId);
	}

	static fromString(lineStr: string, lineId = 'A') {
		const line = new BoardLine(null, lineId);
		line._values = lineStr.split('') as PuzzleValueLine;
		return line;
	}

	// reset all lazy values, set new board property if given
	reset(board: SimpleBoard | null) {
		if (board != null) {
			this._board = board;
		}
		this._values = null;
		this._coords = null;
		this._counts = null;
		this._numRequired = null;
		this._validPermutations = null;
		this._least = null;
		this._most = null;
		return this;
	}

	getCoords(i: number) {
		const x = this.type === ROW ? i : this.index;
		const y = this.type === COLUMN ? i : this.index;
		return { x, y };
	}
	get length(): number {
		if (this._values != null) return this._values.length;
		if (this._coords != null) return this._coords.length;
		return this.values.length;
	}

	get values(): ROPuzzleValueLine {
		if (this._values == null) {
			if (this._board == null) {
				throw new Error('Need board for BoardLine values.');
			}
			this._values = this._board.getLine.call(this._board, this.lineId);
		}
		return this._values;
	}
	get coords(): Vec[] {
		if (this._coords == null) {
			this._coords = this.values.map((_val, i) => {
				return this.getCoords(i);
			})
		}
		return this._coords;
	}
	get counts(): PuzzleValueCount {
		if (this._counts == null) {
			this._counts = countLineValues([...this.values]);
		}
		return this._counts;
	}
	get numRequired() {
		if (this._numRequired == null) {
			// if the board has a numRequired property, use that
			// else calculate the numRequired the normal way
			if (this._board && this._board.numRequired != null) {
				this._numRequired = this._board.numRequired[this.type];
			} else {
				this._numRequired = lineSizeToNumRequired(this.length);
			}
		}
		return this._numRequired;
	}
	get validPermutations(): LineArrSymbolPermutations {
		if (this._validPermutations == null) {
			const { values, counts, numRequired } = this;
			const maxZero = numRequired[ZERO];
			const maxOne = numRequired[ONE];
			const validPerms = getValidLinePermutations([...values], counts, maxZero, maxOne);
			if (!validPerms) {
				this._validPermutations = [];
			} else {
				this._validPermutations = [...validPerms];
			}
		}
		return this._validPermutations;
	}
	get numEmpty() {
		return this.counts[EMPTY];
	}
	get numFilled() {
		return this.length - this.numEmpty;
	}
	get isFilled() {
		return this.numEmpty === 0;
	}

	getValueCount(value: PuzzleValue) {
		return this.counts[value];
	}
	// amount of times this value still needs to be placed in this line
	getValueRemaining(value: PuzzleSymbol) {
		return this.numRequired[value] - this.getValueCount(value);
	}

	getLeastRemaining() {
		const oneRemaining = this.getValueRemaining(ONE);
		const zeroRemaining = this.getValueRemaining(ZERO);
		const result = Math.min(zeroRemaining, oneRemaining);
		this._least = result;
		return result;
	}
	getMostRemaining() {
		const oneRemaining = this.getValueRemaining(ONE);
		const zeroRemaining = this.getValueRemaining(ZERO);
		const result = Math.max(zeroRemaining, oneRemaining);
		this._most = result;
		return result;
	}
	get leastRem() {
		return this._least ?? this.getLeastRemaining();
	}
	get mostRem() {
		return this._most ?? this.getMostRemaining();
	}

	// STRINGIFY METHODS
	toString() {
		return this.values.join('');
	}
	toFullString() {
		return `${this.lineId}:${this.toString()}`;
	}
}