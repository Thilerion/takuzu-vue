import { COLUMN, EMPTY, ONE, ROW, ZERO, type LineType, type PuzzleSymbol, type PuzzleValue } from "../constants";
import { findIncorrectValuesFromSolution } from "../mistakes/incorrect-values.js";
import type { FoundIncorrectValue } from "../mistakes/types.js";
import type { ColumnId, IterableBoardLineString, LineId, BoardExportString, PuzzleGrid, RowId, Vec, BoardString, Target, BoardShape } from "../types";
import { array2d, cloneArray2d, columnIdToX, getCoordsForBoardSize, isLineIdColumn, isLineIdRow, isPuzzleValueLineStr, isValidCellDigit, isValidPuzzleValue, lineSizeToNumRequired, rowIdToY, shuffle } from "../utils";
import { validateBoard } from "../validate/board";
import { generateColumnIds, generateRowIds, getImportBoardStringData } from "./Board.helpers.js";
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

	static fromString(exportedStr: BoardString | BoardExportString, dims?: BoardShape) {
		const { width, height, boardStr } = getImportBoardStringData(exportedStr, dims);
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
	// TODO: accept an optional width/height, to bypass deducePuzzleDimensions
	static import(str: BoardString | BoardExportString, dims?: BoardShape) {
		return SimpleBoard.fromString(str, dims);
	}
	// TODO: accept an optional width/height, to bypass deducePuzzleDimensions
	static fromArrayOfLines(arr: string[]) {
		// validate that every value is a PuzzleValue, or every item in array is a PuzzleValueLine
		const isValid = arr.every(l => isPuzzleValueLineStr(l));
		if (!isValid) {
			throw new Error('Cannot parse array of lines, not all values are PuzzleValues');
		}
		return this.fromString(arr.join('') as BoardString);
	}

	/**
	 * Parses a 2d array of strings, numbers, or null/undefined into a Board
	 * Null, undefined, empty string, and " " values are treated as empty cells
	 * The string "1" and number 1 are treated as ONE
	 * The string "0" and number 0 are treated as ZERO
	 */
	static from2dArray(arr2: (string | number | null | undefined)[][]) {
		const grid: PuzzleGrid = [];
		for (const inputRow of arr2) {
			const row: PuzzleValue[] = [];
			for (const inputVal of inputRow) {
				if (typeof inputVal === 'string') {
					if (isValidPuzzleValue(inputVal)) {
						row.push(inputVal);
					} else if (inputVal === ' ' || inputVal === '') {
						row.push(EMPTY);
					} else {
						throw new Error(`Cannot parse ["${inputVal}"] as a PuzzleValue`);
					}
				} else if (typeof inputVal === 'number') {
					if (inputVal === 1 || inputVal === 0) {
						row.push(`${inputVal}`);
					} else {
						throw new Error(`Cannot parse [${inputVal}] as a PuzzleValue`);
					}
				} else if (inputVal == null) {
					row.push(EMPTY);
				} else {
					throw new Error(`Cannot parse [${inputVal}] as a PuzzleValue`);
				}
			}
			grid.push(row);
		}
		return new SimpleBoard(grid);
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
		} else {
			throw new Error(`Invalid lineId ("${lineId}") in Board.assignLine()`);
		}
	}
	assignTarget(tg: Target): this {
		const { x, y, value } = tg;
		return this.assign(x, y, value);
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
	*cells({ skipFilled = false, skipEmpty = false, shuffled = false }: CellsIteratorOptions = {}) {
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
			yield BoardLine.fromBoard(this, lineId);
		}
	}

	get numEmpty() {
		let count = 0;
		for (const value of this.values()) {
			if (value === EMPTY) count += 1;
		}
		return count;
	}

	isRowId(id: string): id is RowId {
		return this.rowIds.includes(id);
	}
	isColumnId(id: string): id is ColumnId {
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
		const origResult = findIncorrectValuesFromSolution({ board: this, solution: solutionBoard });
		if (origResult.hasMistakes) {
			return { hasMistakes: true, result: origResult.results };
		} else return { hasMistakes: false, result: null };
	}
	// checks if the board is solved by comparing to the solutionBoard
	equalsSolution(solutionBoard: SimpleBoard) {
		return this.isFilled() && this.toBoardString() === solutionBoard.toBoardString();
	}

	// CLASS UTILTIES
	copy(): SimpleBoard {
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
		return this.grid.flat().join('') as BoardString;
	}

	static gridToBoardString(grid: PuzzleGrid) {
		return grid.flat().join('') as BoardString;
	}

	export(): BoardExportString {
		return `${this.width}x${this.height};${this.toBoardString()}` as BoardExportString;
	}
}

interface IncorrectCheckNoMistakesResult {
	hasMistakes: false,
	result: null
}
interface IncorrectCheckMistakesResult {
	hasMistakes: true,
	result: FoundIncorrectValue[]
}
export type IncorrectCheckReturnValue = IncorrectCheckMistakesResult | IncorrectCheckNoMistakesResult;
export type CellsIteratorOptions = {
	skipFilled?: boolean,
	skipEmpty?: boolean,
	shuffled?: boolean
}