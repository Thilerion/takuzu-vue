import { COLUMN, EMPTY, ONE, PUZZLE_VALUES, ROW, ZERO, type LineType, type PuzzleSymbol, type PuzzleValue } from "./constants";
import { memoize } from "./memoize.utils";
import type { BoardExportString, ColumnId, Grid, LineId, PuzzleSymbolLine, PuzzleSymbolLineStr, PuzzleValueLine, PuzzleValueLineStr, RowId } from "./types";

// ARRAY UTILS //
export const array2d = <T = unknown>(width: number, height = width, value: T) => {
	return Array(height).fill(null).map(() => Array(width).fill(value));
}
export const cloneArray2d = <T>(arr2: Grid<T>): Grid<T> => {
	return arr2.map(row => [...row]);
}
export const shuffle = <T>(arrOrig: T[]): T[] => {
	const arr = [...arrOrig];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
export const range = (n: number) => Array(n).fill(null).map((_, idx) => idx);
export const count = <T, K extends T>(arr: T[], targetValue: K) => {
	return arr.reduce((acc, val) => {
		if (val === targetValue) acc += 1;
		return acc;
	}, 0);
}
export const countValuesInMap = <T>(arr: T[]) => {
	return arr.reduce((acc, val) => {
		const num = (acc.get(val) || 0) + 1;
		acc.set(val, num);
		return acc;
	}, new Map() as Map<T, number>);
}
export const randomIndex = (arr: ReadonlyArray<unknown>) => Math.floor(Math.random() * arr.length);
export const pickRandom = <T>(arr: ReadonlyArray<T>) => arr[randomIndex(arr)];


// BOARD / CELL UTILS //
export const isValidCellDigit = (value: unknown): value is PuzzleSymbol => value === ONE || value === ZERO;
export const isValidPuzzleValue = (value: unknown): value is PuzzleValue => (PUZZLE_VALUES as ReadonlyArray<unknown>).includes(value);

export const toggleValue = (value: PuzzleValue, oneFirst = false) => {
	const isEmpty = !isValidCellDigit(value);

	const toggleOrder = oneFirst ? [ONE, ZERO, EMPTY] : [ZERO, ONE, EMPTY];

	if (isEmpty) {
		return toggleOrder[0];
	} else if (value === toggleOrder[0]) {
		return toggleOrder[1];
	} else if (value === toggleOrder[1]) {
		return toggleOrder[2];
	} else {
		throw new Error(`Unexpected value: ${value} in toggleValue()`);
	}
}

export const countLineValues = (lineArr: PuzzleValue[]) => {
	return lineArr.reduce((acc, val) => {
		if (val === ONE) acc[ONE] += 1;
		else if (val === ZERO) acc[ZERO] += 1;
		else acc[EMPTY] += 1;
		return acc;
	}, { [ONE]: 0, [ZERO]: 0, [EMPTY]: 0 } as Record<PuzzleValue, number>);
}

// faster than casting to strings and comparing them
// IMPORTANT: assumes both lines have the same length; this is always the case in this game type, as rows and columns should never be compared
export const areLinesEqual = (a: string | ReadonlyArray<PuzzleValue>, b: string | ReadonlyArray<PuzzleValue>) => {
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export const lineSizeToNumRequired = (lineSize: number) => {
	return {
		[ONE]: numRequiredOfValue(lineSize, ONE),
		[ZERO]: numRequiredOfValue(lineSize, ZERO)
	}
}
export const numRequiredOfValue = (lineSize: number, value: PuzzleSymbol) => {
	const half = lineSize / 2;
	return value === ONE ? Math.ceil(half) : Math.floor(half);
}

export const getCoordsForBoardSize = memoize(
	(width: number, height: number) => {
		const cellCoords = [];
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				cellCoords.push({ x, y });
			}
		}
		return cellCoords;
	},
	(width: number, height: number) => `${width},${height}`
)

// ROW / COLUMN / LINE UTILS //
export const rowIdToY = (rowId: RowId) => rowId.charCodeAt(0) - 65;
export const columnIdToX = (columnId: ColumnId) => (+columnId) - 1;

export const isLineIdRow = (lineId: LineId): lineId is RowId => /[A-Z]/.test(lineId);
export const isLineIdColumn = (lineId: LineId): lineId is ColumnId => /^\d+$/.test(lineId);
export const isLineId = (str: unknown): str is LineId => {
	return typeof str === 'string' && str.length === 1;
}

export function lineTypeFromLineId(lineId: RowId): typeof ROW;
export function lineTypeFromLineId(lineId: ColumnId): typeof COLUMN;
export function lineTypeFromLineId(lineId: LineId): LineType;
export function lineTypeFromLineId(lineId: string): LineType {
	if (isLineIdRow(lineId)) return ROW;
	if (isLineIdColumn(lineId)) return COLUMN;
	throw new Error('Unrecognized lineId');
}

export function getLineDataFromId(id: RowId): { lineId: RowId, lineType: typeof ROW };
export function getLineDataFromId(id: ColumnId): { lineId: ColumnId, lineType: typeof COLUMN };
export function getLineDataFromId(id: LineId): { lineId: RowId, lineType: typeof ROW } | { lineId: ColumnId, lineType: typeof COLUMN };
export function getLineDataFromId(id: LineId): { lineId: LineId, lineType: LineType } {
	if (isLineIdRow(id)) {
		return { lineId: id, lineType: ROW };
	} else if (isLineIdColumn(id)) {
		return { lineId: id, lineType: COLUMN };
	}
	throw new Error('Unrecognized lineId');
}

const lineValueOrder = [ZERO, ONE, EMPTY] as const;

export const sortLineValues = <T extends PuzzleValue>(values: T[] | ReadonlyArray<T>): T[] => {
	const copy: T[] = [...values];
	copy.sort((a, z) => {
		return lineValueOrder.indexOf(a) - lineValueOrder.indexOf(z);
	})
	return copy;
}

export const isPuzzleValueLineStr = (str: string): str is PuzzleValueLineStr => {
	return /^[01.]+$/.test(str);
}
export const isPuzzleSymbolLineStr = (str: string): str is PuzzleSymbolLineStr => {
	return /^[01]+$/.test(str);
}

interface SplitLineFn {
	(str: PuzzleValueLineStr): PuzzleValueLine;
	(str: PuzzleSymbolLineStr): PuzzleSymbolLine;
	(str: PuzzleSymbolLineStr | PuzzleValueLineStr): PuzzleValueLine;
	(str: string): string[];
}
export const splitLine: SplitLineFn = (str: PuzzleSymbolLineStr | PuzzleValueLineStr) => {
	// slight problem: if input string is neither ValueLineStr or SymbolLineStr (but a string literal), the result is ValueLine even though there may be other characters
	if (import.meta.env.DEV) {
		for (const char of str) {
			if (!isPuzzleValueLineStr(char)) {
				throw new Error(`Can only call split line with ValueLineStr or SymbolLineStr. Unexpected char: "${char}"`);
			}
		}
	}
	// Overloads take care of this, cast to any is (somewhat?) safe
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return str.split('') as any[];
}