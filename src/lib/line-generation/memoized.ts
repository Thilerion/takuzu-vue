import { ONE, ZERO, type PuzzleSymbol } from "../constants.js";
import { memoize } from "../memoize.utils.js";
import { generateAllLineCompletions, generateValidLineCompletions } from "./completions.js";
import { generateValidLinesOfSize } from "./lines-of-size.js";
import { generateUniqueArrayPermutations } from "./permutations.js";

const stringifyOptionalNumReq = (numReq: undefined | Record<PuzzleSymbol, number>): string => {
	if (numReq == null) return '';
	return `-${numReq[ZERO]}-${numReq[ONE]}`;
}

/**
 * 
 * Previously called: "getArrayPermutations"
 */
export const getUniqueArrayPermutations = memoize(
	generateUniqueArrayPermutations,
	(lineArr) => lineArr.join('')
);

/**
 * 
 * Previously called: "getEmptyLinePermutations"
 */
export const getValidLinesOfSize = memoize(
	generateValidLinesOfSize,
	(size: number, numRequired) => `${size}${numRequired ? stringifyOptionalNumReq(numRequired) : ''}`
);

/**
 * 
 * Previously called: "getLinePermutations"
 */
export const getAllLineCompletions = memoize(
	generateAllLineCompletions,
	(lineArr) => lineArr.join('')
);

/**
 * 
 * Previously called: "getValidLinePermutations"
 */
export const getValidLineCompletions = memoize(
	generateValidLineCompletions,
	(lineArr, _counts, numRequired) => {
		let str = lineArr.join('');
		if (numRequired == null) return str;
		str += stringifyOptionalNumReq(numRequired);
		return str;
	}
);