import { EMPTY, ONE, ZERO, type LineType, type PuzzleSymbol, type PuzzleValue } from "../constants.js";
import { getValidLineCompletions } from "../line-generation/memoized.js";
import type { LineArrSymbolPermutations } from "../line-generation/types.js";
import type { LineId, PuzzleValueCount, PuzzleValueLine, ROPuzzleValueLine, Target, Vec, VecValue } from "../types.js";
import { areLinesEqual, columnIdToX, countLineValues, isLineIdRow, lineSizeToNumRequired, lineTypeFromLineId, rowIdToY } from "../utils.js";
import type { SimpleBoard } from "./Board.js";

export class BoardLine {
	public lineId: LineId;
	public type: LineType;
	public index: number;

	private _board: SimpleBoard | null;
	private _values: PuzzleValueLine | null;

	private _coords: null | Vec[] = null;
	private _counts: null | PuzzleValueCount = null;
	private _numRequired: null | Record<PuzzleSymbol, number> = null;
	private _validPermutations: null | LineArrSymbolPermutations = null;
	private _remaining: Record<PuzzleSymbol, null | number> = {
		[ZERO]: null,
		[ONE]: null
	}
	private _least: null | number = null;
	private _most: null | number = null;

	private constructor(
		boardOrValues: SimpleBoard | PuzzleValueLine,
		lineId: LineId,
	) {
		if (Array.isArray(boardOrValues)) {
			this._values = boardOrValues;
			this._board = null;
		} else {
			this._board = boardOrValues;
			this._values = null;
		}

		this.lineId = lineId;

		this.type = lineTypeFromLineId(this.lineId);
		this.index = isLineIdRow(lineId) ? rowIdToY(lineId) : columnIdToX(lineId);
	}

	static fromBoard(board: SimpleBoard, lineId: LineId) {
		return new BoardLine(board, lineId);
	}
	static fromValues(values: PuzzleValueLine, lineId: LineId) {
		return new BoardLine(values, lineId);
	}

	// reset lazy values, set new values or new board
	reset(board: SimpleBoard): this;
	reset(values: PuzzleValueLine): this;
	reset(boardOrValues: SimpleBoard | PuzzleValueLine): this {
		if (Array.isArray(boardOrValues)) {
			this._values = boardOrValues;
			this._board = null;
		} else {
			this._board = boardOrValues;
			this._values = null;
		}
		this._coords = null;
		this._counts = null;
		this._numRequired = null;
		this._validPermutations = null;
		this._remaining = {
			[ZERO]: null,
			[ONE]: null
		}
		this._least = null;
		this._most = null;
		return this;
	}

	get length(): number {
		return this.values.length;
	}
	get values(): ROPuzzleValueLine {
		if (this._values != null) {
			return this._values;
		}
		if (this._board == null) {
			throw new Error('BoardLine has no values or board');
		}
		this._values = this._board.getLine(this.lineId);
		return this._values;
	}

	getCoords(i: number): Vec {
		const x = this.type === 'row' ? i : this.index;
		const y = this.type === 'column' ? i : this.index;
		return { x, y };
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
			const validPerms = getValidLineCompletions([...values], counts, numRequired);
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

	/** Returns true if the cell values in the current BoardLine are exactly the same as in the other BoardLine or values array. */
	equalsValues(other: BoardLine | PuzzleValueLine) {
		const otherValues = Array.isArray(other) ? other : other.values;
		return areLinesEqual(this.values, otherValues);
	}
	/** Returns true if the cell values and the lineId in both BoardLines are exactly the same. */
	equalsStrict(other: BoardLine) {
		return this.lineId === other.lineId && this.equalsValues(other);
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
	get countRemaining() {
		const res = {
			[ZERO]: this._remaining[ZERO] ?? this.getValueRemaining(ZERO),
			[ONE]: this._remaining[ONE] ?? this.getValueRemaining(ONE)
		}
		this._remaining = res;
		return res;
	}
	get leastRem() {
		return this._least ?? this.getLeastRemaining();
	}
	get mostRem() {
		return this._most ?? this.getMostRemaining();
	}
	/**
	 * Returns the symbol with the least remaining to be placed in this line.
	 * If the line is filled, returns null.
	 * If both symbols have the same amount remaining, returns string "both".
	 */
	get leastRemSymbol(): PuzzleSymbol | null | "both" {
		const rem = this.countRemaining;
		if (rem[ZERO] === 0 && rem[ONE] === 0) return null;
		else if (rem[ZERO] === rem[ONE]) return "both";
		else if (rem[ZERO] < rem[ONE]) return ZERO;
		else return ONE;
	}
	/**
	 * Returns the symbol with the most remaining to be placed in this line.
	 * If the line is filled, returns null.
	 * If both symbols have the same amount remaining, returns string "both".
	 */
	get mostRemSymbol(): PuzzleSymbol | null | "both" {
		const rem = this.countRemaining;
		if (rem[ZERO] === 0 && rem[ONE] === 0) return null;
		else if (rem[ZERO] === rem[ONE]) return "both";
		else if (rem[ZERO] < rem[ONE]) return ONE;
		else return ZERO;
	}

	isMostRemainingSymbol(value: PuzzleSymbol) {
		const s = this.mostRemSymbol;
		return s === 'both' || s === value;
	}
	isLeastRemainingSymbol(value: PuzzleSymbol) {
		const s = this.leastRemSymbol;
		return s === 'both' || s === value;
	}

	// STRINGIFY METHODS
	toString() {
		return this.values.join('');
	}
	toFullString() {
		return `${this.lineId}:${this.toString()}`;
	}

	diff(other: BoardLine | PuzzleValueLine): (Vec & { values: [PuzzleValue, PuzzleValue] })[] {
		const otherValues = Array.isArray(other) ? other : other.values;
		const diff: (Vec & { values: [PuzzleValue, PuzzleValue] })[] = [];
		this.values.forEach((val, i) => {
			if (val !== otherValues[i]) {
				diff.push({ ...this.coords[i], values: [val, otherValues[i]] });
			}
		});
		return diff;
	}

	*eachCell(): Generator<VecValue, void, undefined> {
		for (let i = 0; i < this.length; i++) {
			yield { value: this.values[i], ...this.getCoords(i) };
		}
	}
	*eachValue(): Generator<PuzzleValue, void, undefined> {
		yield* this.values;
	}
	*eachCoord(): Generator<Vec, void, undefined> {
		yield* this.coords;
	}
}