import { EMPTY, ONE, ZERO } from "../constants";
import { countLineValues, lineSizeToNumRequired, memoize, numRequiredOfValue, sortLineValues } from "../utils";
import { validateLine } from "../validate/line.js";
import permuteUnique from "./permute.js";

export const getArrayPermutations = memoize(
	(values) => {
		const sortedValues = sortLineValues(values);
		return permuteUnique(sortedValues);
	},
	{ argsToKey: (lineArr, _lineCount) => lineArr.join('') }
);

export const getEmptyLinePermutations = memoize(
	(size) => {
		const num = Math.pow(2, size);
		const perms = [];
		for (let i = 0; i < num; i++) {
			// convert i to binary value (as string)
			// which is just 1s and 0s, just like a binary board line
			const line = i.toString(2).padStart(size, '0');
			perms.push(line);
		}
		const maxOne = numRequiredOfValue(size, ONE);
		const maxZero = numRequiredOfValue(size, ZERO);
		return perms.filter(lineStr => {
			return validateLine(lineStr, maxZero, maxOne);
		})
	},
	{ argsToKey: (size) => String(size) }
);

export const getLinePermutations = memoize(
	(lineArr, lineCount) => {
		if (lineCount == null) lineCount = countLineValues(lineArr);
		
		const numRequired = lineSizeToNumRequired(lineArr.length);
		const remainingOne = numRequired[ONE] - lineCount[ONE];
		const remainingZero = numRequired[ZERO] - lineCount[ZERO];
		
		if (remainingOne < 0 || remainingZero < 0) return []; //line is invalid

		const values = (ZERO.repeat(remainingZero) + '' + ONE.repeat(remainingOne)).split('');
		const valuePermutations = getArrayPermutations(values);
		const result = valuePermutations.map(valuePerm => {
			const vals = [...valuePerm];
			return lineArr.map(v => v === EMPTY ? vals.shift() : v);
		})
		return result;

	},
	{ argsToKey: (lineArr, _lineCount) => lineArr.join('') }
);

export const getValidLinePermutations = memoize(
	(lineArr, lineCount, maxZero, maxOne) => {
		if (!lineCount) lineCount = countLineValues(lineArr);
		if (maxZero == null || maxOne == null) {
			throw new Error('required max one and max zero for getValidLinePermutations');
		}
		const linePermutations = getLinePermutations(lineArr, lineCount);
		return linePermutations.filter(pValues => {
			return validateLine(pValues.join(''), maxZero, maxOne);
		})
	},
	{
		argsToKey: (lineArr, _lineCount, maxZero, maxOne) => {
			return [lineArr, '', maxZero, maxOne].flat(2).join('-');
		}
	}
);