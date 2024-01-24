import { memoize } from "../memoize.utils.js";
import { generateAllLineCompletions, generateValidLineCompletions } from "./completions.js";
import { generateValidLinesOfSize } from "./lines-of-size.js";
import { generateUniqueArrayPermutations } from "./permutations.js";


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
	(size: number) => String(size)
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
	(lineArr) => lineArr.join('')
);