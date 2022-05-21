import { COLUMN, EMPTY, ONE, ROW, ZERO } from "../constants.js";
import { array2d, cloneArray2d, columnIdToX, count, deducePuzzleDimensionsFromLength, generateColumnIds, generateRowIds, getCoordsForBoardSize, isExportString, isValidCellDigit, parseExportString, rowIdToY, shuffle } from "../utils.js";
import { validateBoard } from "../validate/board.js";
import { BoardLine } from "./BoardLine.js";
import { ThreesUnit } from "./ThreesUnit.js";

export class SimpleBoard {
	constructor(grid) {
		this.grid = grid;
		
		this.width = this.grid[0].length;
		this.height = this.grid.length;

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
	static import(exportStr) {
		return SimpleBoard.fromString(exportStr);
	}
	static fromString(exportedStr) {
		const data = { width: null, height: null, boardStr: exportedStr };
		const isExport = isExportString(exportedStr);
		if (isExport) {
			const { width, height, boardStr } = parseExportString(exportedStr);
			Object.assign(data, { width, height, boardStr });
		} else {
			const { width, height } = deducePuzzleDimensionsFromLength(exportedStr.length);
			data.width = width;
			data.height = height;
		}

		const { width, height, boardStr } = data;
		if (boardStr.length < width * height) {
			console.warn(`Unexpected boardStr size, smaller than board dimensions (str len: ${boardStr.length}, dimensions: ${width}x${height}=${width * height})`);
		}

		const grid = [];
		for (let y = 0; y < height; y++) {
			const row = [];
			for (let x = 0; x < width; x++) {
				const idx = (y * width) + x;
				const rawVal = boardStr[idx];
				if (rawVal == ONE) row.push(ONE);
				else if (rawVal == ZERO) row.push(ZERO);
				else row.push(EMPTY);
			}
			grid.push(row);
		}
		return new SimpleBoard(grid);
	}

	// RETRIEVE BOARD VALUES;
	// TODO: retrieve lines/columns/rows
	get(x, y) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
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
	assignRow(y, values) {
		if (!Array.isArray(values) || values.length !== this.width) {
			throw new Error("Can only assign row with an array of values");
		}
		this.grid.splice(y, 1, [...values]);
		return this;
	}
	assignColumn(x, values) {
		if (!Array.isArray(values) || values.length !== this.height) {
			throw new Error("Can only assign column with an array of values");
		}
		for (let y = 0; y < this.height; y++) {
			this._set(x, y, values[y]);
		}
		return this;
	}
	assignLine(lineId, values) {
		if (this.rowIds.includes(lineId)) {
			return this.assignRow(rowIdToY(lineId), values);
		} else if (this.columnIds.includes(lineId)) {
			return this.assignColumn(columnIdToX(lineId), values);
		}
	}
	_set(x, y, value) {
		this.grid[y][x] = value;
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
	*threesUnits() {
		const maxRowX = this.width - 2;
		const maxColY = this.height - 2;

		for (const coords of this.cellCoords()) {
			const { x, y } = coords;
			if (x < maxRowX) {
				yield new ThreesUnit(x, y, ROW, this);
			}
			if (y < maxColY) {
				yield new ThreesUnit(x, y, COLUMN, this);
			}
		}
	}
	*boardLines() {
		for (const lineId of this.lineIds) {
			yield new BoardLine(this, lineId);
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
	
	export() {
		return `${this.width}x${this.height};${this.toBoardString()}`;
	}
}