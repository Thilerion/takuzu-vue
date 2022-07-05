import { COLUMN, EMPTY, ONE, ROW, ZERO, type LineType, type PuzzleSymbol, type PuzzleValue } from "../constants";
import type { ColumnId, IterableBoardLineString, LineId, BoardExportString, PuzzleGrid, RowId, Vec, BoardString } from "../types";
import { array2d, cloneArray2d, columnIdToX, deducePuzzleDimensionsFromLength, generateColumnIds, generateRowIds, getCoordsForBoardSize, isExportString, isLineIdColumn, isLineIdRow, isValidCellDigit, lineSizeToNumRequired, parseExportString, rowIdToY, shuffle } from "../utils";
import { validateBoard } from "../validate/board";
import { BoardLine } from "./BoardLine";
import { ThreesUnit } from "./ThreesUnit";

export class SimpleBoard {
	grid: PuzzleGrid;
	width: number;
	height: number;
	numRequired: Record<LineType, Record<PuzzleSymbol, number>>;
	rowIds: string[];
	columnIds: string[];
	lineIds: string[];

	constructor(grid: PuzzleGrid) {
		this.grid = grid;
		this.width = grid[0].length;
		this.height = grid.length;
		this.numRequired = {
			[ROW]: lineSizeToNumRequired(this.width),
			[COLUMN]: lineSizeToNumRequired(this.height)
		}
		this.rowIds = generateRowIds(this.height);
		this.columnIds = generateColumnIds(this.width);
		this.lineIds = [...this.rowIds, ...this.columnIds];
	}

	static empty(width: number, height = width) {
		const grid: PuzzleGrid = array2d(width, height, EMPTY);
		return new SimpleBoard(grid);
	}
	static fromString(exportedStr: string) {
		const isExport = isExportString(exportedStr);
		let width: number;
		let height: number;
		let boardStr: string;
		if (isExport) {
			const parsed = parseExportString(exportedStr);
			width = parsed.width;
			height = parsed.height;
			boardStr = parsed.boardStr;
		} else {
			const dims = deducePuzzleDimensionsFromLength(exportedStr.length);
			width = dims.width;
			height = dims.height;
			boardStr = exportedStr;
		}
		if (boardStr.length < width * height) {
			throw new Error(`Unexpected boardStr size, smaller than board dimensions (str len: ${boardStr.length}, dimensions: ${width}x${height}=${width * height})`);
		}

		const grid: PuzzleGrid = [];
		for (let y = 0; y < height; y++) {
			const row: PuzzleValue[] = [];
			for (let x = 0; x < width; x++) {
				const idx = (y * width) + x;
				const rawVal = boardStr[idx];
				if (rawVal === ONE) {
					row.push(ONE);
				} else if (rawVal === ZERO) {
					row.push(ZERO);
				} else row.push(EMPTY);
			}
			grid.push(row);
		}
		return new SimpleBoard(grid);
	}
	static import(str: BoardExportString) {
		return SimpleBoard.fromString(str);
	}

	get(x: number, y: number): PuzzleValue {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
			// return null;
			// TODO: return null here? or remove this check?
			throw new Error('X and/or Y value not in range.');
		}
		return this.grid[y][x];
	}
	isCellEmpty(x: number, y: number) {
		return this.get(x, y) === EMPTY;
	}
	getColumn(x: ColumnId | number) {
		const coordX = typeof x === 'string' ? columnIdToX(x) : x;
		return this.grid.map(row => row[coordX]);
	}
	getRow(y: RowId | number) {
		const coordY = typeof y === 'string' ? rowIdToY(y) : y;
		return [...this.grid[coordY]];
	}
	getLine(lineId: LineId) {
		if (isLineIdColumn(lineId)) {
			return this.getColumn(lineId);
		} else if (isLineIdRow(lineId)) {
			return this.getRow(lineId);
		} else {
			throw new Error(`Invalid lineId ("${lineId}")`);
		}
	}

	// SET BOARD VALUES
	// TODO: set lines/columns/rows
	assign(x: number, y: number, value: PuzzleValue) {
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
	assignRow(y: number, values: PuzzleValue[]) {
		if (!Array.isArray(values) || values.length !== this.width) {
			throw new Error("Can only assign row with an array of values");
		}
		this.grid.splice(y, 1, [...values]);
		return this;
	}
	assignColumn(x: number, values: PuzzleValue[]) {
		if (!Array.isArray(values) || values.length !== this.height) {
			throw new Error("Can only assign column with an array of values");
		}
		for (let y = 0; y < this.height; y++) {
			this._set(x, y, values[y]);
		}
		return this;
	}
	assignLine(lineId: LineId, values: PuzzleValue[]) {
		if (this.isRowId(lineId)) {
			return this.assignRow(rowIdToY(lineId), values);
		} else if (this.isColumnId(lineId)) {
			return this.assignColumn(columnIdToX(lineId), values);
		}
	}
	_set(x: number, y: number, value: PuzzleValue) {
		this.grid[y][x] = value;
		return this;
	}

	cellCoords({ shuffled = false } = {}) {
		const coords: Vec[] = getCoordsForBoardSize(this.width, this.height);
		if (shuffled) return shuffle(coords);
		return [...coords];
	}
	*values() {
		for (const { x, y } of this.cellCoords()) {
			yield this.get(x, y);
		}
	}
	*cells({ skipFilled = false, skipEmpty = false, shuffled = false } = {}) {
		for (const coords of this.cellCoords({ shuffled })) {
			const { x, y } = coords;
			const cellValue = this.get(x, y);

			if (skipFilled && cellValue !== EMPTY) continue;
			if (skipEmpty && cellValue === EMPTY) continue;

			yield { x, y, value: cellValue };
		}
	}
	*lineStrings(): Generator<IterableBoardLineString> {
		for (const lineId of this.lineIds) {
			const lineValues = this.getLine(lineId);
			yield {
				lineStr: lineValues.join(''),
				lineType: this.isRowId(lineId) ? ROW : COLUMN,
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

	get numEmpty() {
		let count = 0;
		for (const value of this.values()) {
			if (value === EMPTY) count += 1;
		}
		return count;
	}

	private isRowId(id: string): id is RowId {
		return this.rowIds.includes(id);
	}
	private isColumnId(id: string): id is ColumnId {
		return this.columnIds.includes(id);
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
	hasIncorrectValues(solutionBoard: SimpleBoard): IncorrectCheckReturnValue {
		const incorrectValueCells = [];
		for (const cell of this.cells({ skipEmpty: true })) {
			const { x, y, value } = cell;
			if (solutionBoard.get(x, y) !== value) {
				incorrectValueCells.push({ x, y });
			}
		}
		const hasMistakes = incorrectValueCells.length > 0;
		if (hasMistakes) {
			return { hasMistakes: true, result: incorrectValueCells };
		} else {
			return { hasMistakes: false, result: null }
		}
	}
	// checks if the board is solved by comparing to the solutionBoard
	equalsSolution(solutionBoard: SimpleBoard) {
		return this.isFilled() && this.toBoardString() === solutionBoard.toBoardString();
	}

	// CLASS UTILTIES
	copy() {
		const grid = cloneArray2d(this.grid);
		return new SimpleBoard(grid);
	}

	// STRINGIFY UTILITIES
	toString(): BoardString {
		return this.toBoardString();
	}
	toDisplayString() {
		return this.grid.map(row => {
			return row.join('');
		}).join('\n');
	}
	toBoardString(): BoardString {
		return this.grid.flat().join('');
	}
	
	export() {
		return `${this.width}x${this.height};${this.toBoardString()}` as BoardExportString;
	}
}

interface IncorrectCheckNoMistakesResult {
	hasMistakes: false,
	result: null
}
interface IncorrectCheckMistakesResult {
	hasMistakes: true,
	result: Vec[]
}
type IncorrectCheckReturnValue = IncorrectCheckMistakesResult | IncorrectCheckNoMistakesResult;