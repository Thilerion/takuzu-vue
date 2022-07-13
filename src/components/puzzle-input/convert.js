import { EMPTY, ONE, ZERO } from "@/lib/constants";
import { chunk } from "@/utils/array.ts.utils";

export const puzzleStringToGrid = (str, dimensions) => {
	if (dimensions == null) throw new Error('Puzzle string to grid requires dimensions.');
	const expandedStr = expandPuzzleString(str, dimensions);
	const { width, height } = dimensions;
	const chunked = chunk(expandedStr.split(''), width);

	const correctHeight = chunked.length === height;
	const correctWidth = chunked.every(row => row.length === width);
	if (!correctHeight || !correctWidth) {
		throw new Error('Result is not of correct width and/or height.');
	}
	return chunked;
}

export const puzzleGridToString = (arr2, { width, height }, opts = {}) => {
	let str = '';
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const ch = arr2[y][x];
			if (ch === ONE || ch === ZERO) {
				str += ch;
			} else str += EMPTY;
		}
	}
	const { shorten = false } = opts;
	if (shorten) {
		const padEnd = opts.padEnd ?? false;
		str = shortenPuzzleString(str, { width, height }, { padEnd });
	}
	return str;
}

export const expandPuzzleString = (str, dimensions) => {
	let expanded = '';
	for (const ch of str) {
		if (ch === ZERO || ch === ONE || ch === EMPTY) {
			expanded += ch;
		} else {
			const digit = Number(ch);
			if (Number.isNaN(digit)) {
				throw new Error(`Could not convert ${ch} to a digit: is NaN`);
			}
			expanded += EMPTY.repeat(digit);
		}
	}
	if (dimensions == null) return str;

	const { width, height } = dimensions;
	const numCells = width * height;
	const lengthDiff = numCells - expanded.length;
	if (lengthDiff > 0) {
		expanded += EMPTY.repeat(lengthDiff);
	} else if (lengthDiff !== 0) {
		throw new Error('Length difference in expanded puzzle string and amount of cells');
	}
	return expanded;
}

export const shortenPuzzleString = (str, { width, height }, { padEnd = false } = {}) => {
	let shortened = '';
	let currentEmptySequence = 0;
	let i = 0;
	for (const ch of str) {
		if (ch === EMPTY || ch === ' ') {
			currentEmptySequence += 1;
			continue;
		}
		if (currentEmptySequence > 0) {			
			const digits = toSingleDigitSequence(currentEmptySequence);
			shortened += digits;
			if (digits === '.') {
				i += 1;
			} else if (digits.length === 1) {
				i += Number(digits);
			} else {
				const count = digits.split('').map(Number).reduce((acc, val) => acc + val, 0);
				i += count;
			}
			currentEmptySequence = 0;
		}
		if (ch === ONE || ch === ZERO) {
			shortened += ch;
			i += 1;
		}
	}
	if (!padEnd) {
		// do not include the final currentEmptySequence
		return shortened;
	}

	const numCells = width * height;
	if (i < numCells) {
		const diff = numCells - i;
		shortened += toSingleDigitSequence(diff);
	}
	return shortened;
}
export function toSingleDigitSequence(num) {
	if (num < 10 && num > 1) {
		return `${num}`;
	} else if (num === 1) {
		return EMPTY;
	} else if (num === 0) {
		return '';
	} else if (num < 0 || num == null || typeof num !== 'number') {
		throw new TypeError(`Input number is invalid; cannot be lower than 0 and must be a number (was ${num})`);
	}

	const values = [];
	let n = num;

	while (n > 18) {
		n -= 9;
		values.push(9);
	}
	if (n > 9) {
		const halves = [
			Math.ceil(n / 2),
			Math.floor(n / 2)
		]
		n -= halves[0];
		n -= halves[1];
		values.push(...halves);
	}
	if (n !== 0) {
		throw new Error(`Remaining number is not 0! Remainder is ${n}, and the values are ${values.join(',')}`);
	}
	return values.join('');
}