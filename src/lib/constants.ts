// cell/symbol/value types
export const ONE = '1';
export const ZERO = '0';
export const EMPTY = '.';

export const PUZZLE_SYMBOLS = [ONE, ZERO] as const;
export const PUZZLE_VALUES = [ONE, ZERO, EMPTY] as const;

export type PuzzleSymbol = typeof PUZZLE_SYMBOLS[number];
export type PuzzleValue = typeof PUZZLE_VALUES[number];

// line types
export const ROW = 'row';
export const COLUMN = 'column';
export type Row = typeof ROW;
export type Column = typeof COLUMN;

export type LineType = Row | Column;