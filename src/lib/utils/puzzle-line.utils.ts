import { type PuzzleValue, ONE, ZERO, EMPTY, type PuzzleSymbol, COLUMN, ROW, type LineType } from "../constants";
import type { PuzzleValueLineStr, PuzzleSymbolLineStr, ColumnId, LineId, PuzzleSymbolLine, PuzzleValueLine, RowId } from "../types";

export const isPuzzleValueLineStr = (str: string): str is PuzzleValueLineStr => {
	return /^[01.]+$/.test(str);
}
export const isPuzzleSymbolLineStr = (str: string): str is PuzzleSymbolLineStr => {
	return /^[01]+$/.test(str);
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

type VerifyPuzzleValueLine<T extends string, A extends string = ""> =
  T extends `${infer F}${infer R}` ? 
    F extends PuzzleValue ? VerifyPuzzleValueLine<R, `${A}${F}`> : `${A}${PuzzleValue}` : 
  A;
type VerifyPuzzleSymbolLine<T extends string, A extends string = ""> =
  T extends `${infer F}${infer R}` ? 
	F extends PuzzleSymbol ? VerifyPuzzleSymbolLine<R, `${A}${F}`> : `${A}${PuzzleSymbol}` : 
  A;
interface SplitLineFn {
	(str: PuzzleValueLineStr): PuzzleValueLine;
	(str: PuzzleSymbolLineStr): PuzzleSymbolLine;
	(str: PuzzleSymbolLineStr | PuzzleValueLineStr): PuzzleValueLine;
	<T extends string>(str: T): T extends VerifyPuzzleValueLine<T> ? PuzzleValueLine : T extends VerifyPuzzleSymbolLine<T> ? PuzzleSymbolLine : T extends (VerifyPuzzleSymbolLine<T> | VerifyPuzzleValueLine<T>) ? PuzzleValueLine : string[];
}
export const splitLine: SplitLineFn = <T extends string>(str: T | PuzzleSymbolLineStr | PuzzleValueLineStr) => {
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