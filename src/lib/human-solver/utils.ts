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
		const most =boardLine.mostRem;

		return least >= leastRange[0] && least <= leastRange[1] && most >= mostRange[0] && most <= mostRange[1];
	}
}

export function getRecurringValuesFromPermutations(boardLine: BoardLine, permutations: LineArrSymbolPermutations): Target[] {
	const { values, length } = boardLine;

	if (permutations.length === 1) {
		// just use all values in this single permutation
		return permutations[0].reduce((acc, val, idx) => {
			if (values[idx] === EMPTY) {
				const { x, y } = boardLine.getCoords(idx);
				acc.push({ x, y, value: val });
			}
			return acc;
		}, [] as Target[]);
	}

	const recurringValues: Target[] = [];
	for (let i = 0; i < length; i++) {
		// for each place in the line, check the values of all permutations
		if (values[i] !== EMPTY) continue;

		const permValueFirst = permutations[0][i];
		const isRecurring = permutations.every(otherPermVals => otherPermVals[i] === permValueFirst);
		if (isRecurring) {
			const { x, y } = boardLine.getCoords(i);
			recurringValues.push({ x, y, value: permValueFirst });
		}
	}
	return recurringValues;
}