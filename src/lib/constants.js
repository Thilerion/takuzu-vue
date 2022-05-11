// value types
export const ONE = '1';
export const ZERO = '0';
export const EMPTY = '.';

export const PUZZLE_SYMBOLS = [ONE, ZERO, EMPTY];

export const OPPOSITE_VALUE = {
	[ONE]: ZERO,
	[ZERO]: ONE
}

// line types
export const ROW = 'row';
export const COLUMN = 'column';