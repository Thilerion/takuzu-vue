import type { LineArrValuePermutations } from "./types.js";
import type { ROPuzzleValueLine, PuzzleValueLine } from "../types.js";
import { sortLineValues } from "../utils.js";
import { permuteUnique } from "./utils.js";

export function generateUniqueArrayPermutations(values: ROPuzzleValueLine): LineArrValuePermutations {
	const sortedValues: PuzzleValueLine = sortLineValues(values);
	return permuteUnique(sortedValues);
}