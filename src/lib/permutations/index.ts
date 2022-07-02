import { EMPTY, ONE, ZERO, type PuzzleSymbol, type PuzzleValue } from "../constants";
import { memoize } from "../memoize.utils";
import type { LineValueCount, PuzzleSymbolLine, PuzzleSymbolLineStr, PuzzleValueLine, ROPuzzleSymbolLine, ROPuzzleValueLine } from "../types";
import { countLineValues, lineSizeToNumRequired, numRequiredOfValue, sortLineValues } from "../utils";
import { validateLine } from "../validate/line";
import permuteUnique from "./permute";

const innerGetArrayPermutations = (values: PuzzleValueLine): readonly ROPuzzleValueLine[] => {
	const sortedValues = sortLineValues(values);
	return permuteUnique(sortedValues);
}
export const getArrayPermutations = memoize(
	innerGetArrayPermutations,
	(lineArr) => lineArr.join('')
);

const innerGetEmptyLinePermutations = (size: number) => {
	const num = Math.pow(2, size);
	const perms: PuzzleSymbolLineStr[] = [];
	for (let i = 0; i < num; i++) {
		// convert i to binary value (as string)
		// which is just 1s and 0s, just like a binary board line
		const line = i.toString(2).padStart(size, '0');
		perms.push(line);
	}
	const maxOne = numRequiredOfValue(size, ONE);
	const maxZero = numRequiredOfValue(size, ZERO);
	const validPerms: readonly PuzzleSymbolLineStr[] = perms.filter(lineStr => {
		return validateLine(lineStr, maxZero, maxOne);
	})
	return validPerms;
}
export const getEmptyLinePermutations = memoize(innerGetEmptyLinePermutations, (size: number) => String(size));

const innerGetLinePermutations = (
	lineArr: PuzzleValueLine,
	lineCount?: LineValueCount
): readonly ROPuzzleSymbolLine[] => {
	if (lineCount == null) lineCount = countLineValues(lineArr);
	const numRequired = lineSizeToNumRequired(lineArr.length);
	const remainingOne = numRequired[ONE] - lineCount[ONE];
	const remainingZero = numRequired[ZERO] - lineCount[ZERO];

	if (remainingOne < 0 || remainingZero < 0) return []; //line is invalid

	const values = (ZERO.repeat(remainingZero) + '' + ONE.repeat(remainingOne)).split('') as PuzzleSymbol[];
	const valuePermutations = getArrayPermutations(values);
	const result = valuePermutations.map(valuePerm => {
		const vals: PuzzleValueLine = [...valuePerm];
		return lineArr.map(v => v === EMPTY ? vals.shift() : v).filter((v): v is PuzzleSymbol => v !== undefined);
	})
	return result;
}
export const getLinePermutations = memoize(
	innerGetLinePermutations,
	(lineArr) => lineArr.join('')
)

const innerGetValidLinePermutations = (
	lineArr: PuzzleValueLine,
	lineCount: LineValueCount,
	maxZero: number,
	maxOne: number
): readonly ROPuzzleSymbolLine[] => {
	const linePerms = getLinePermutations(lineArr, lineCount);
	return linePerms.filter(pValues => validateLine(pValues.join(''), maxZero, maxOne));
}
export const getValidLinePermutations = memoize(
	innerGetValidLinePermutations,
	(lineArr, _lineCount, maxZero, maxOne) => {
		return [lineArr, '', maxZero, maxOne].flat(2).join('-');
	}
)