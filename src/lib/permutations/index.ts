import { EMPTY, ONE, ZERO } from "../constants";
import { memoize } from "../memoize.utils";
import type { PuzzleValueCount, PuzzleValueLine, ROPuzzleValueLine, PuzzleSymbolLine } from "../types";
import { countLineValues, lineSizeToNumRequired, sortLineValues } from "../utils";
import { validateLine } from "../validate/line";
import { generateAllValidFilledLines } from "./generate-filled-lines.js";
import permuteUnique from "./permute";
import type { LineArrValuePermutations, LineArrSymbolPermutations } from "./types.js";

const innerGetArrayPermutations = (values: ROPuzzleValueLine): LineArrValuePermutations => {
	const sortedValues: PuzzleValueLine = sortLineValues(values);
	return permuteUnique(sortedValues);
}
export const getArrayPermutations = memoize(
	innerGetArrayPermutations,
	(lineArr) => lineArr.join('')
);

export const getEmptyLinePermutations = memoize(generateAllValidFilledLines, (size: number) => String(size));

const innerGetLinePermutations = (
	lineArr: PuzzleValueLine,
	lineCount?: PuzzleValueCount
): LineArrSymbolPermutations | { error: string } => {
	if (lineCount == null) lineCount = countLineValues(lineArr);
	const numRequired = lineSizeToNumRequired(lineArr.length);
	const remainingOne = numRequired[ONE] - lineCount[ONE];
	const remainingZero = numRequired[ZERO] - lineCount[ZERO];

	if (remainingOne < 0 || remainingZero < 0) return { error: 'No valid permutations, line is invalid and has no solution' };

	// values to insert into lineArr in place of EMPTY
	const valuesToPlace: PuzzleSymbolLine = [...Array(remainingZero).fill(ZERO), ...Array(remainingOne).fill(ONE)];

	const valuePermutations = getArrayPermutations(valuesToPlace) as LineArrSymbolPermutations; // cast because input was PuzzleSymbolLine, so can only contain symbols
	const result = valuePermutations.map(valuePerm => {
		const toInsert = [...valuePerm]; // insert at places where lineArr has EMPTY
		const mapped = lineArr.map(origVal => {
			if (origVal === EMPTY) {
				return toInsert.shift()!; // known not to be undefined, because toInsert has same length as amount of EMPTY places in lineArr			
			} else return origVal;
		})
		return mapped;
	})
	return result;
}
export const getLinePermutations = memoize(
	innerGetLinePermutations,
	(lineArr) => lineArr.join('')
)

const innerGetValidLinePermutations = (
	lineArr: PuzzleValueLine,
	lineCount: PuzzleValueCount,
	maxZero: number,
	maxOne: number
): LineArrSymbolPermutations => {
	const linePerms = getLinePermutations(lineArr, lineCount);
	// TODO: what about the case where line is already filled?
	if (Array.isArray(linePerms)) {
		const validPerms = linePerms.filter(pValues => validateLine(pValues.join(''), maxZero, maxOne));
		return validPerms;
	}
	// TODO: different type return value if lineArr (input) is invalid, filteredLinePerms is empty, and thus there are no valid line permutatations
	return [];
}

export const getValidLinePermutations = memoize(
	innerGetValidLinePermutations,
	(lineArr, _lineCount, maxZero, maxOne) => {
		return [lineArr, '', maxZero, maxOne].flat(2).join('-');
	}
)