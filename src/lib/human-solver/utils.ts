import type { BoardLine } from "../board/BoardLine";
import { EMPTY } from "../constants";
import type { LineArrSymbolPermutations } from "../permutations";
import type { Target } from "../types";
import type { ValueRange } from "./types";

export const createFilterLinesByRemainingValues = (leastRange: ValueRange, mostRange: ValueRange) => {
	if (leastRange.length !== 2 || mostRange.length !== 2) {
		throw new Error('Can only filter with ranges of length 2.');
	}
	return (boardLine: BoardLine) => {
		if (boardLine.isFilled) return false;

		const least = boardLine.leastRem;
		const most = boardLine.mostRem;

		return least >= leastRange[0] && least <= leastRange[1] && most >= mostRange[0] && most <= mostRange[1];
	}
}