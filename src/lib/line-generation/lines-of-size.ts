import { type PuzzleSymbol, ZERO, ONE } from "../constants.js";
import type { PuzzleSymbolLineStr } from "../types.js";
import { lineSizeToNumRequired } from "../utils.js";
import type { LineStrSymbolPermutations } from "./types.js";

function _recurseGenerateValidLinesOfSize(
	length: number,
	currentLine: PuzzleSymbolLineStr,
	lastValue: PuzzleSymbol | null,
	secondLastValue: PuzzleSymbol | null,
	remainingZero: number,
	remainingOne: number,
): LineStrSymbolPermutations {
	// Base case: if the current line length equals the target length, return the line.
	if (currentLine.length === length) {
		return [currentLine];
	}

	// Initialize an array to hold all valid lines
	const validLines: PuzzleSymbolLineStr[] = [];

	// Recursively generate all valid lines by adding a zero or one to the current line.
	if ((lastValue !== ZERO || secondLastValue !== ZERO) && remainingZero > 0) {
		// If the last two values are not zero, we can add a zero to the current line.
		validLines.push(..._recurseGenerateValidLinesOfSize(
			length,
			`${currentLine}${ZERO}`,
			ZERO,
			lastValue,
			remainingZero - 1,
			remainingOne,
		));
	}
	if ((lastValue !== ONE || secondLastValue !== ONE) && remainingOne > 0) {
		// If the last two values are not one, we can add a one to the current line.
		validLines.push(..._recurseGenerateValidLinesOfSize(
			length,
			`${currentLine}${ONE}`,
			ONE,
			lastValue,
			remainingZero,
			remainingOne - 1,
		));
	}
	return [...validLines];
}

export function generateValidLinesOfSize(length: number, _numRequired?: Record<PuzzleSymbol, number>): LineStrSymbolPermutations {
	const numRequired = _numRequired ?? lineSizeToNumRequired(length);

	return _recurseGenerateValidLinesOfSize(
		length,
		'',
		null,
		null,
		numRequired[ZERO],
		numRequired[ONE],
	);
}

// Old version, but after benchmarking proved to be about 4x slower than "generateValidLinesOfSize"
/* const innerGetEmptyLinePermutations = (size: number): LineStrSymbolPermutations => {
	const num = Math.pow(2, size);
	const perms: PuzzleSymbolLineStr[] = [];
	for (let i = 0; i < num; i++) {
		// convert i to binary value (as string)
		// which is just 1s and 0s, just like a binary board line
		const line: PuzzleSymbolLineStr = i.toString(2).padStart(size, '0');
		perms.push(line);
	}
	const maxOne = numRequiredOfValue(size, ONE);
	const maxZero = numRequiredOfValue(size, ZERO);
	const validPerms = perms.filter(lineStr => {
		return validateLine(lineStr, maxZero, maxOne);
	})
	return validPerms;
} */