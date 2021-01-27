import { COLUMN, EMPTY, ONE, ROW, ZERO } from "../constants";
import { array2d, cloneArray2d, columnIdToX, count, generateColumnIds, generateRowIds, getCoordsForBoardSize, isValidCellDigit, rowIdToY, shuffle } from "../utils";
import { validateBoard } from "../validate/board";

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

		this.rowIds = generateRowIds(this.height);
		this.columnIds = generateColumnIds(this.width);
		this.lineIds = [...this.rowIds, ...this.columnIds];
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
	getColumn(x) {
		if (typeof x === 'string') {
			x = columnIdToX(x);
		}
		return this.grid.map(row => row[x]);
	}
	getRow(y) {
		if (typeof y === 'string') {
			y = rowIdToY(y);
		}
		return [...this.grid[y]];
	}
	getLine(lineId) {
		if (typeof lineId !== 'string') {
			throw new Error('LineId in board.getLine should be a string');
		}
		if (this.rowIds.includes(lineId)) {
			return this.getRow(lineId);
		} else if (this.columnIds.includes(lineId)) {
			return this.getColumn(lineId);
		}
		throw new Error(`Invalid lineId ("${lineId}")`);
	}

	get numEmpty() {
		// TODO: cache gridCounts?
		const flat = [...this.grid].flat();
		return count(flat, EMPTY);
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

	// BOARD ITERATION METHODS
	cellCoords({ shuffled = false } = {}) {
		const coords = getCoordsForBoardSize(this.width, this.height);
		if (shuffled) return shuffle(coords);
		return [...coords];
	}
	*cells({ skipFilled = false, skipEmpty = false, shuffled = false } = {}) {
		for (let coords of this.cellCoords({ shuffled })) {
			const { x, y } = coords;
			const cellValue = this.get(x, y);

			if (skipFilled && cellValue !== EMPTY) continue;
			if (skipEmpty && cellValue === EMPTY) continue;

			yield { x, y, value: cellValue };
		}
	}
	*lineStrings() {
		for (const lineId of this.lineIds) {
			const lineValues = this.getLine(lineId);
			yield {
				lineStr: lineValues.join(''),
				lineType: this.rowIds.includes(lineId) ? ROW : COLUMN,
				lineId
			}
		}
	}

	// VALIDITY / SOLVED CHECKS
	isFilled() {
		return !this.grid.flat().includes(EMPTY);
	}
	isValid() {
		return validateBoard(this, true);
	}
	isSolved() {
		return this.isFilled() && this.isValid();
	}

	// compare values to a solutionBoard
	// does not check for "rule violations", only compares to the solution
	hasIncorrectValues(solutionBoard) {
		const incorrectValueCells = [];
		for (const cell of this.cells({ skipEmpty: true })) {
			const { x, y, value } = cell;
			if (solutionBoard.get(x, y) !== value) {
				incorrectValueCells.push({ x, y });
			}
		}
		const hasMistakes = incorrectValueCells.length > 0;
		return {
			hasMistakes,
			result: hasMistakes ? incorrectValueCells : null
		}
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