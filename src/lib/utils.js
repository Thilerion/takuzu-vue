import { EMPTY, ONE, ZERO } from "./constants";

// MEMOIZE FUNCTION //
const defaultArgsToKey = (...args) => args.join(',');
export function memoize(fn, opts = {}) {
	const {
		argsToKey = defaultArgsToKey,
		cache = {}
	} = opts;
	return (...a) => {
		const key = argsToKey(...a);
		if (cache[key] == null) {
			const result = fn(...a);
			cache[key] = result;
		}
		return cache[key];
	}
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


// BOARD / CELL UTILS //
export const isValidCellDigit = (value) => value === ONE || value === ZERO;

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