import { shuffle } from "@/utils/random.utils";
import { COLUMN, EMPTY, ROW, type PuzzleValue } from "../constants";
import { findIncorrectValuesFromSolution } from "../mistakes/incorrect-values.js";
import type { FoundIncorrectValue } from "../mistakes/types.js";
import type { ColumnId, IterableBoardLineString, LineId, BoardExportString, PuzzleGrid, RowId, Vec, BoardString, Target, BoardShape, NumSymbolRequired } from "../types";
import { validateBoard } from "../validate/board";
import { generateColumnIds, generateRowIds, generateBoardCoords } from "./Board.helpers.js";
import { BoardLine } from "./BoardLine";
import { ThreesUnit } from "./ThreesUnit";
import { boardStringToPuzzleGrid, puzzleGridToBoardString, puzzleGridToExportString } from "./board-conversion.helpers.js";
import { isPuzzleValue } from "../utils/puzzle-value.utils";
import { columnIdToX, isLineIdColumn, isLineIdRow, isPuzzleValueLineStr, lineSizeToNumRequired, rowIdToY } from "../utils/puzzle-line.utils";
import { array2d, cloneArray2d } from "@/utils/array2d.utils";

export class SimpleBoard {
	grid: PuzzleGrid;
	width: number;
	height: number;
	numRequired: NumSymbolRequired;
	rowIds: ReadonlyArray<RowId>;
	columnIds: ReadonlyArray<ColumnId>;

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
	}

	get lineIds() {
		return [...this.rowIds, ...this.columnIds];
	}

	static empty(width: number, height = width) {
		const grid: PuzzleGrid = array2d(width, height, EMPTY);
		return new SimpleBoard(grid);
	}

	static fromGrid(grid: PuzzleGrid) {
		return new SimpleBoard(cloneArray2d(grid));
	}

	static fromString(exportedStr: BoardString | BoardExportString, dims?: BoardShape) {
		const grid = boardStringToPuzzleGrid(exportedStr, dims);
		return new SimpleBoard(grid);
	}
	static import(str: BoardString | BoardExportString, dims?: BoardShape) {
		return SimpleBoard.fromString(str, dims);
	}
	static fromArrayOfLines(arr: string[], dims?: BoardShape) {
		// validate that every value is a PuzzleValue, or every item in array is a PuzzleValueLine
		const isValid = arr.every(l => isPuzzleValueLineStr(l));
		if (!isValid) {
			throw new Error('Cannot parse array of lines, not all values are PuzzleValues');
		}
		return this.fromString(arr.join('') as BoardString, dims);
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
					if (isPuzzleValue(inputVal)) {
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
		if (!this.isXInBounds(x) || !this.isYInBounds(y)) {
			throw new BoardOutOfBoundsError({ width: this.width, height: this.height, position: { x, y } });
		}
		return this.grid[y][x];
	}
	atPos(pos: Vec) {
		return this.get(pos.x, pos.y);
	}
	getColumn(x: ColumnId | number) {
		const coordX = typeof x === 'string' ? columnIdToX(x) : x;
		if (!this.isXInBounds(coordX)) {
			throw new BoardOutOfBoundsError({ position: `column ${x}`, width: this.width, height: this.height });
		}
		return this.grid.map(row => row[coordX]);
	}
	getRow(y: RowId | number) {
		const coordY = typeof y === 'string' ? rowIdToY(y) : y;
		if (!this.isYInBounds(coordY)) {
			throw new BoardOutOfBoundsError({ position: `row ${y}`, width: this.width, height: this.height });
		}
		return [...this.grid[coordY]];
	}
	getLine(lineId: LineId) {
		if (isLineIdColumn(lineId)) {
			return this.getColumn(lineId);
		} else if (isLineIdRow(lineId)) {
			return this.getRow(lineId);
		} else {
			throw new BoardOutOfBoundsError({ position: `line ${lineId}`, width: this.width, height: this.height });
		}
	}

	// SET BOARD VALUES

	/**
	 * Set a value on the board, without validation of the arguments.
	 * Unsafe, use with caution. Primarily used for internal methods.
	 */
	u_set(x: number, y: number, value: PuzzleValue) {
		this.grid[y][x] = value;
		return this;
	}

	assign(x: number, y: number, value: PuzzleValue) {
		if (x == null || y == null) {
			throw new BoardAssignmentError('X and Y value required for assignment');
		} else if (!this.isXInBounds(x) || !this.isYInBounds(y)) {
			throw new BoardAssignmentError('Tried to assign value to out of bounds position.');
		}

		if (!isPuzzleValue(value)) {
			console.error(`Tried to assign "${value}" to board, but this is not a PuzzleValue. Assigning an empty cell instead.`);
			// TODO: 25-4-2024; throw BoardAssignmentError instead
			value = EMPTY;
		}

		this.u_set(x, y, value);

		return this;
	}
	assignRow(y: number, values: PuzzleValue[]) {
		if (!Array.isArray(values) || values.length !== this.width) {
			throw new BoardAssignmentError('assignRow() requires an array of values with the same length as the board width.');
		}
		this.grid.splice(y, 1, [...values]);
		return this;
	}
	assignColumn(x: number, values: PuzzleValue[]) {
		if (!Array.isArray(values) || values.length !== this.height) {
			throw new BoardAssignmentError('assignColumn() requires an array of values with the same length as the board height.');
		}
		for (let y = 0; y < this.height; y++) {
			this.u_set(x, y, values[y]);
		}
		return this;
	}
	assignLine(lineId: LineId, values: PuzzleValue[]) {
		if (this.isKnownRowId(lineId)) {
			return this.assignRow(rowIdToY(lineId), values);
		} else if (this.isKnownColumnId(lineId)) {
			return this.assignColumn(columnIdToX(lineId), values);
		} else {
			throw new BoardAssignmentError(`invalid lineId "${lineId}" in Board.assignLine()`);
		}
	}
	assignTarget(tg: Target): this {
		const { x, y, value } = tg;
		return this.assign(x, y, value);
	}

	cellCoords({ shuffled = false } = {}): (Readonly<Vec>)[] {
		const coords = generateBoardCoords(this.width, this.height);
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
				lineType: this.isKnownRowId(lineId) ? ROW : COLUMN,
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

	getNumEmpty() {
		let count = 0;
		for (const value of this.values()) {
			if (value === EMPTY) count += 1;
		}
		return count;
	}

	/** Determines that a string is a RowId that is available on this board. */
	isKnownRowId(id: string): id is RowId {
		return this.rowIds.includes(id);
	}

	/** Determines that a string is a ColumnId that is available on this board. */
	isKnownColumnId(id: string): id is ColumnId {
		return this.columnIds.includes(id);
	}

	isXInBounds(x: number) {
		return x >= 0 && x < this.width;
	}
	isYInBounds(y: number) {
		return y >= 0 && y < this.height;
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

	// CLASS UTILTIES
	copy(): SimpleBoard {
		const grid = cloneArray2d(this.grid);
		return new SimpleBoard(grid);
	}
	clone(): SimpleBoard {
		return this.copy();
	}

	// STRINGIFY UTILITIES
	toDisplayString() {
		return this.grid.map(row => {
			return row.join('');
		}).join('\n');
	}
	toBoardString(): BoardString {
		return puzzleGridToBoardString(this.grid);
	}

	export(): BoardExportString {
		const dims = { width: this.width, height: this.height };
		return puzzleGridToExportString(this.grid, dims);
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

// Error classes used by the SimpleBoard class, which extend the Error class: OutOfBoundsError, InvalidLineIdError, and an error that is thrown when parsing a string/array/grid etc to create a SimpleBoard cannot be done
type BoardOutOfBoundsErrorData = BoardShape & { position: Vec | string };
export class BoardOutOfBoundsError extends Error {
	constructor(data: BoardOutOfBoundsErrorData, opts?: ErrorOptions) {
		const positionStr = typeof data.position === 'string' ? data.position : `${data.position.x},${data.position.y}`;
		super(`Tried to access out of bounds position (${positionStr}), while the board has a width of ${data.width} and height of ${data.height}.`, opts);
		this.name = 'BoardOutOfBoundsError';
		Object.setPrototypeOf(this, BoardOutOfBoundsError.prototype);
	}
}
export class BoardAssignmentError extends Error {
	constructor(message: string, opts?: ErrorOptions) {
		super(`Cannot assign value(s) to board: ${message}`, opts);
		this.name = 'BoardAssignmentError';
		Object.setPrototypeOf(this, BoardAssignmentError.prototype);
	}
}