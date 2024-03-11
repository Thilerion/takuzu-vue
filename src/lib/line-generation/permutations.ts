import type { LineArrValuePermutations } from "./types.js";
import type { ROPuzzleValueLine, PuzzleValueLine } from "../types.js";
import { permuteUnique } from "./utils.js";
import { sortLineValues } from "../utils/puzzle-line.utils.js";

export function generateUniqueArrayPermutations(values: ROPuzzleValueLine): LineArrValuePermutations {
	const sortedValues: PuzzleValueLine = sortLineValues(values);
	return permuteUnique(sortedValues);
}