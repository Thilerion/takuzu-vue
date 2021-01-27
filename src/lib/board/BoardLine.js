import { COLUMN, EMPTY, ROW } from "../constants";
import { columnIdToX, rowIdToY, lineTypeFromLineId, countLineValues, lineSizeToNumRequired } from "../utils";

export class BoardLine {
	constructor(board, lineId) {
		this.lineId = lineId;
		this.type = lineTypeFromLineId(this.lineId);
		this.index = this.type === ROW ? rowIdToY(lineId) : columnIdToX(lineId);

		this._board = board;

		// lazy values
		this._values = null;
		this._coords = null;
		this._counts = null;
		this._numRequired = null;
		// TODO: validPermutations properties
		// this._validPermutations = null;
	}

	static fromString(lineStr, lineId = 'A') {
		const line = new BoardLine(null, lineId);
		line._values = lineStr.split('');
		return line;
	}

	// reset all lazy values, set new board property if given
	reset(board) {
		if (board != null) {
			this._board = board;
		}
		this._values = null;
		this._coords = null;
		this._counts = null;
		this._numRequired = null;
		// this._validPermutations = null;
		return this;
	}

	getCoords(i) {
		const x = this.type === ROW ? i : this.index;
		const y = this.type === COLUMN ? i : this.index;
		return { x, y };
	}

	// LAZY EVALUATION GETTERS
	get values() {
		if (this._values == null) {
			this._values = this._board.getLine.call(this._board, this.lineId);
		}
		return this._values;
	}
	get coords() {
		if (this._coords == null) {
			this._coords = this.values.map((_val, i) => {
				return this.getCoords(i);
			})
		}
		return this._coords;
	}
	get counts() {
		if (this._counts == null) {
			// if the board has a lineCounts property, use that
			// else calculate the counts the normal way
			if (this._board && this._board.lineCounts != null) {
				this._counts = this._board.lineCounts[this.lineId];
			} else {
				this._counts = countLineValues(this.values);
			}
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
	// get validPermutations() {

	// }

	// OTHER GETTERS
	get length() {
		if (this._board) {
			return this.type === ROW ? this._board.width : this._board.height;
		} else {
			return this.values.length;
		}
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

	getValueCount(value) {
		return this.counts[value];
	}
	// amount of times this value still needs to be placed in this line
	getValueRemaining(value) {
		return this.numRequired[value] - this.getValueCount(value);
	}

	// STRINGIFY METHODS
	toString() {
		return this.values.join('');
	}
	toFullString() {
		return `${this.lineId}:${this.toString()}`;
	}
}