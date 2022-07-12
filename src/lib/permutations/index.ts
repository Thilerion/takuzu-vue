import { EMPTY, ONE, ZERO, type PuzzleSymbol } from "../constants";
import { memoize } from "../memoize.utils";
import type { PuzzleValueCount, PuzzleSymbolLineStr, PuzzleValueLine, ROPuzzleSymbolLine, ROPuzzleValueLine, PuzzleSymbolLine } from "../types";
import { countLineValues, lineSizeToNumRequired, numRequiredOfValue, sortLineValues } from "../utils";
import { validateLine } from "../validate/line";
import permuteUnique from "./permute";

export type LineArrValuePermutations = ReadonlyArray<ROPuzzleValueLine>;
export type LineArrSymbolPermutations = ReadonlyArray<ROPuzzleSymbolLine>;
export type LineStrSymbolPermutations = ReadonlyArray<PuzzleSymbolLineStr>;

const innerGetArrayPermutations = (values: ROPuzzleValueLine): LineArrValuePermutations => {
	const sortedValues: PuzzleValueLine = sortLineValues(values);
	return permuteUnique(sortedValues);
}
export const getArrayPermutations = memoize(
	innerGetArrayPermutations,
	(lineArr) => lineArr.join('')
);

const innerGetEmptyLinePermutations = (size: number): LineStrSymbolPermutations => {
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
}
export const getEmptyLinePermutations = memoize(innerGetEmptyLinePermutations, (size: number) => String(size));

const innerGetLinePermutations = (
	lineArr: PuzzleValueLine,
	lineCount?: PuzzleValueCount
): LineArrSymbolPermutations | { error: string } => {
	if (lineCount == null) lineCount = countLineValues(lineArr);
	const numRequired = lineSizeToNumRequired(lineArr.length);
	const remainingOne = numRequired[ONE] - lineCount[ONE];
	const remainingZero = numRequired[ZERO] - lineCount[ZERO];

	// TODO: different type return value if line is invalid
	if (remainingOne < 0 || remainingZero < 0) return { error: 'No valid permutations, line is invalid and has no solution' }; //line is invalid

	const values = (ZERO.repeat(remainingZero) + '' + ONE.repeat(remainingOne)).split('') as PuzzleSymbolLine;
	const valuePermutations = getArrayPermutations(values) as LineArrSymbolPermutations; // cast because input was PuzzleSymbolLine, so can only contain symbols
	const result = valuePermutations.map(valuePerm => {
		const vals = [...valuePerm];
		const mapped = lineArr.map(origVal => {
			if (origVal === EMPTY) {
				const shifted = vals.shift();
				if (shifted == null) {
					console.error('Shifted is undefined!!');
				}
				return shifted;				
			} else return origVal;
		})
		return mapped.filter((symbolOrUndef): symbolOrUndef is PuzzleSymbol => symbolOrUndef !== undefined);
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