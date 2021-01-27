import { COLUMN, EMPTY, ONE, ROW, ZERO } from "../constants";
import { array2d, cloneArray2d, isValidCellDigit } from "../utils";

export class SimpleBoard {
	constructor(grid) {
		this.grid = grid;
		
		this.width = this.grid.length;
		this.height = this.grid[0].length;

		// TODO: validate grid size
		
		this.numRequired = {
			[ROW]: {
				[ONE]: Math.ceil(this.width / 2),
				[ZERO]: Math.floor(this.width / 2),
			},
			[COLUMN]: {
				[ONE]: Math.ceil(this.height / 2),
				[ZERO]: Math.floor(this.height / 2),
			}
		}
	}

	// STATIC CLASS INSTANTIATION METHODS
	static empty(width, height = width) {
		const grid = array2d(width, height, EMPTY);
		return new SimpleBoard(grid);
	}

	// RETRIEVE BOARD VALUES;
	// TODO: retrieve lines/columns/rows
	get(x, y) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.width) {
			// return null;
			// TODO: return null here? or remove this check?
			throw new Error('X and/or Y value not in range.');
		}
		return this.grid[y][x];
	}
	isCellEmpty(x, y) {
		return this.get(x, y) === EMPTY;
	}

	// SET BOARD VALUES
	// TODO: set lines/columns/rows
	assign(x, y, value) {
		if (x == null && y != null) {
			// TODO: assign row
			throw new Error('Assign row not yet implemented');
		} else if (x != null && y == null) {
			// TODO: assign column
			throw new Error('Assign column not yet implemented');
		} else if (x == null && y == null) {
			throw new Error('X and/or Y value required for assignment');
		}

		if (!isValidCellDigit(value)) {
			console.warn(`Value: "${value}" is not a valid grid value; defaulting to "EMPTY"`);
			value = EMPTY;
		}

		// TODO: update grid and line counts?
		
		this._set(x, y, value);
		
		return this;
	}
	_set(x, y, value) {
		this.grid[y].splice(x, 1, value);
		return this;
	}

	// VALIDITY / SOLVED CHECKS
	isFilled() {
		return !this.grid.flat().includes(EMPTY);
	}
	isValid() {
		// TODO: validateBoard
	}
	isSolved() {
		return this.isFilled() && this.isValid();
	}

	// compare values to a solutionBoard
	// does not check for "rule violations", only compares to the solution
	hasIncorrectValues(solutionBoard) {
		const incorrectValues = [];
		// TODO: cells iterator
	}
	// checks if the board is solved by comparing to the solutionBoard
	equalsSolution(solutionBoard) {
		return this.isFilled() && this.toBoardString() === solutionBoard.toBoardString();
	}



	// CLASS UTILTIES
	copy() {
		const grid = cloneArray2d(this.grid);
		return new SimpleBoard(grid);
	}

	// STRINGIFY UTILITIES
	toString() {
		return this.toBoardString();
	}
	toDisplayString() {
		return this.grid.map(row => {
			return row.join('');
		}).join('\n');
	}
	toBoardString() {
		return this.grid.flat().join('');
	}
}