import { EMPTY, ONE, ZERO } from "./constants";

export const array2d = (width, height = width, value = null) => {
	return Array(height).fill(null).map(() => Array(width).fill(value));
}
export const cloneArray2d = (arr2) => {
	return arr2.map(row => [...row]);
}

export const isValidCellDigit = (value) => value === ONE || value === ZERO || value === EMPTY;