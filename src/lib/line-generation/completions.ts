import { EMPTY, ZERO, ONE } from "../constants.js";
import type { PuzzleValueLineStr, PuzzleValueLine, PuzzleValueCount, PuzzleSymbolLineStr, PuzzleSymbolLine, PuzzleSymbolCount } from "../types.js";
import { countLineValues, lineSizeToNumRequired, splitLine } from "../utils/puzzle-line.utils.js";
import { validateMaxConsecutiveRule } from "../validate/line.js";
import { generateUniqueArrayPermutations } from "./permutations.js";
import type { LineArrSymbolPermutations } from "./types.js";

function _recurseGenerateValidLineCompletions(
	line: PuzzleValueLineStr,
	position: number, // current index/pointer
	remainingZero: number,
	remainingOne: number,
): PuzzleValueLineStr[] {
	// Base case: entire line has been filled, so return it
	if (position === line.length) {
		return [line];
	}

	const validCompletions: PuzzleValueLineStr[] = [];

	const valAtPos = line[position];
	if (valAtPos !== EMPTY) {
		return _recurseGenerateValidLineCompletions(line, position + 1, remainingZero, remainingOne);
	}

	// Check the previous two characters in the line.
	const prev = position > 0 ? line[position - 1] : null;
	const prevPrev = position > 1 ? line[position - 2] : null;
	const next = position + 1 < line.length ? line[position + 1] : null;
	const nextNext = position + 2 < line.length ? line[position + 2] : null;

	// Try adding a ZERO if it doesn't violate the rules and zeros are remaining.
	if (remainingZero > 0 && (prev !== ZERO || prevPrev !== ZERO) && (prev !== ZERO || next !== ZERO) && (next !== ZERO || nextNext !== ZERO)) {
		validCompletions.push(..._recurseGenerateValidLineCompletions(
			line.substring(0, position) + ZERO + line.substring(position + 1),
			position + 1,
			remainingZero - 1,
			remainingOne
		));
	}

	// Try adding a ONE if it doesn't violate the rules and ones are remaining.
	if (remainingOne > 0 && (prev !== ONE || prevPrev !== ONE) && (prev !== ONE || next !== ONE) && (next !== ONE || nextNext !== ONE)) {
		validCompletions.push(..._recurseGenerateValidLineCompletions(
			line.substring(0, position) + ONE + line.substring(position + 1),
			position + 1,
			remainingZero,
			remainingOne - 1
		));
	}

	return validCompletions;
}

/**
 * Get all possible and valid ways to completely fill a (partially filled) line.
 */
export function generateValidLineCompletions(
	lineArr: PuzzleValueLine,
	_lineCount?: PuzzleValueCount,
	_numRequired?: PuzzleSymbolCount
): LineArrSymbolPermutations {
	// Validate max consecutive rule; input may be invalid and without this check, valid line completions would still be generated
	if (!validateMaxConsecutiveRule(lineArr.join(''))) {
		return [];
	}

	const lineCount = _lineCount ?? countLineValues(lineArr);	
	const numRequired = _numRequired ?? lineSizeToNumRequired(lineArr.length);

	const remainingOne = numRequired[ONE] - lineCount[ONE];
	const remainingZero = numRequired[ZERO] - lineCount[ZERO];

	if (remainingOne < 0 || remainingZero < 0) {
		// throw new Error('No valid permutations, line is invalid and has no solution');
		return [];
	}

	const resInner = _recurseGenerateValidLineCompletions(
		lineArr.join(''),
		0,
		remainingZero,
		remainingOne
	) as PuzzleSymbolLineStr[];

	return resInner.map(line => splitLine(line));
}

/**
 * Get all possible ways to completely fill a (partially filled) line, without checking for validity.
 * Resulting lines may be invalid, but they do have the correct amount of 0s and 1s.
 */
export function generateAllLineCompletions(
	lineArr: PuzzleValueLine,
	lineCount?: PuzzleValueCount
): LineArrSymbolPermutations | { error: string; } {
	if (lineCount == null) lineCount = countLineValues(lineArr);
	const numRequired = lineSizeToNumRequired(lineArr.length);
	const remainingOne = numRequired[ONE] - lineCount[ONE];
	const remainingZero = numRequired[ZERO] - lineCount[ZERO];

	if (remainingOne < 0 || remainingZero < 0) return { error: 'No valid permutations, line is invalid and has no solution' };

	// values to insert into lineArr in place of EMPTY
	const valuesToPlace: PuzzleSymbolLine = [...Array(remainingZero).fill(ZERO), ...Array(remainingOne).fill(ONE)];

	const valuePermutations = generateUniqueArrayPermutations(valuesToPlace) as LineArrSymbolPermutations; // cast because input was PuzzleSymbolLine, so can only contain symbols
	const result = valuePermutations.map(valuePerm => {
		const toInsert = [...valuePerm]; // insert at places where lineArr has EMPTY
		const mapped = lineArr.map(origVal => {
			if (origVal === EMPTY) {
				return toInsert.shift()!; // known not to be undefined, because toInsert has same length as amount of EMPTY places in lineArr			
			} else return origVal;
		});
		return mapped;
	});
	return result;
}