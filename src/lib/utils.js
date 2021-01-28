import { COLUMN, EMPTY, ONE, ROW, ZERO } from "./constants";

// MEMOIZE FUNCTION //
const defaultArgsToKey = (...args) => args.join(',');
export function memoize(fn, opts = {}) {
	const {
		argsToKey = defaultArgsToKey,
		initialCache = new Map()
	} = opts;

	let memoized = function (...args) {
		let cache = memoized.cache;
		const key = argsToKey(...args);

		if (cache.has(key)) {
			return cache.get(key);
		}
		const result = fn(...args);
		memoized.cache = cache.set(key, result);
		return result;
	}
	memoized.cache = initialCache;
	return memoized;
}

// ARRAY UTILS //
export const array2d = (width, height = width, value = null) => {
	return Array(height).fill(null).map(() => Array(width).fill(value));
}
export const cloneArray2d = (arr2) => {
	return arr2.map(row => [...row]);
}
export const shuffle = (arrOrig) => {
	const arr = [...arrOrig];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
export const range = n => Array(n).fill(null).map((_, idx) => idx);
export const count = (arr, targetValue) => {
	return arr.reduce((acc, val) => {
		if (val === targetValue) acc += 1;
		return acc;
	}, 0);
}


// BOARD / CELL UTILS //
export const isValidCellDigit = (value) => value === ONE || value === ZERO;

export const toggleValue = (value, oneFirst = false) => {
	const isEmpty = !isValidCellDigit(value);

	const toggleOrder = oneFirst ? [ONE, ZERO, EMPTY] : [ZERO, ONE, EMPTY];

	if (isEmpty) {
		return toggleOrder[0];
	} else if (value === toggleOrder[0]) {
		return toggleOrder[1];
	} else if (value === toggleOrder[1]) {
		return toggleOrder[2];
	}
}

export const countLineValues = (lineArr) => {
	return lineArr.reduce((acc, val) => {
		if (val === ONE) acc[ONE] += 1;
		else if (val === ZERO) acc[ZERO] += 1;
		else acc[EMPTY] += 1;
		return acc;
	}, { [ONE]: 0, [ZERO]: 0, [EMPTY]: 0 });
}

// faster than casting to strings and comparing them
// IMPORTANT: assumes both lines have the same length; this is always the case in this game type, as rows and columns should never be compared
export const areLinesEqual = (a, b) => {
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export const lineSizeToNumRequired = (lineSize) => {
	return {
		[ONE]: numRequiredOfValue(lineSize, ONE),
		[ZERO]: numRequiredOfValue(lineSize, ZERO)
	}
}
export const numRequiredOfValue = (lineSize, value) => {
	const half = lineSize / 2;
	return value === ONE ? Math.ceil(half) : Math.floor(half);
}

export const getCoordsForBoardSize = memoize(
	(width, height) => {
		const cellCoords = [];
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				cellCoords.push({ x, y });
			}
		}
		return cellCoords;
	},
	{
		argsToKey: (width, height) => `${width},${height}`
	}
)

// ROW / COLUMN / LINE UTILS //
export const generateColumnIds = (height) => {
	// row at idx 0 has lineId: 1, then 2, etc
	return range(height).map(val => String(val + 1));
}
export const generateRowIds = (width) => {
	// column at idx 0 has lineId: A, then B, then C
	if (width >= 26) {
		throw new Error('Cannot generate column ids for width higher than "Z"');
	}
	return range(width).map(i => String.fromCharCode(65 + i)); // 65 = uppercase A
}

export const rowIdToY = rowId => rowId.charCodeAt(0) - 65;
export const columnIdToX = columnId => (columnId * 1) - 1;

export const isLineIdRow = lineId => /[A-Z]/.test(lineId);
export const isLineIdColumn = lineId => /^\d+$/.test(lineId);

export const lineTypeFromLineId = lineId => {
	if (isLineIdRow(lineId)) return ROW;
	if (isLineIdColumn(lineId)) return COLUMN;
	throw new Error('Unrecognized lineId');
}

const lineValueOrder = [ZERO, ONE, EMPTY];
export const sortLineValues = (values) => {
	return [...values].sort((a, b) => {
		return lineValueOrder.indexOf(a) - lineValueOrder.indexOf(b);
	})
}