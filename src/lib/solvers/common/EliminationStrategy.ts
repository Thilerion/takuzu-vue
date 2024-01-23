/*
	Function works on 1 BoardLine, and accepts, optioanlly, a list of filledLines which to exclude from the line permutations.
	It then gets valid perms, removes those that are equal to a filled line, gets recurring values, and returns those values.
*/

import type { BoardLine } from "@/lib/board/BoardLine.js";
import type { SolverStrategyResult } from "./types.js";
import type { LineId, ROPuzzleSymbolLine, Target } from "@/lib/types.js";
import { areLinesEqual } from "@/lib/utils.js";
import { EMPTY } from "@/lib/constants.js";
import type { LineArrSymbolPermutations } from "@/lib/permutations/types.js";

export type EliminationStrategyResult = SolverStrategyResult<{
	targets: Target[]
}>;

// TODO: EliminationStrategyResult should include a SolverStrategyInvalidError type, which is returned when the board is deemed invalid, as error
export const checkEliminationStrategy = (boardLine: BoardLine, filledLines?: BoardLine[]): EliminationStrategyResult => {
	// Check if the line is already completely filled. If so, the strategy does not apply, and we return early.
	if (boardLine.isFilled) return { found: false } as const;

	// Retrieve all (valid) possibilities for this line, when filling empty cells with symbols.
	const perms = boardLine.validPermutations;
	// If there are none, the board (or line) is invalid.
	if (!perms || !perms.length) return { found: false } as const;

	// Duplicate lines are not allowed, so we filter out any permutations that are equal to an already filled line if any are given.
	const filteredPerms = filledLines == null ? perms : removeFilledLinesFromPermutations(perms, filledLines).result;
	// If none are left, the board (or line) is invalid.
	if (!filteredPerms.length) return { found: false } as const;

	// Determine the recurring values (targets) from the filtered permutations. These are values that are consistent across all permutations.
	const targets = getRecurringValuesFromPermutations(boardLine, filteredPerms);
	// If no consistent recurring values are found, the strategy does not apply.
	if (!targets.length) return { found: false } as const;

	return { found: true, data: { targets } };
}

export function removeFilledLinesFromPermutations(perms: LineArrSymbolPermutations, filledLines: BoardLine[]): { result: ROPuzzleSymbolLine[] } {
	if (!filledLines.length) return { result: [...perms] };
	const result = perms.filter((perm) => {
		const isDuplicate = filledLines.find(l => areLinesEqual(perm, l.values));
		return isDuplicate == null;
	})

	return { result };
}

export function removeFilledLinesFromPermutationsWithSources(perms: LineArrSymbolPermutations, filledLines: BoardLine[]): {
	result: ROPuzzleSymbolLine[];
	sources: LineId[];
} {
	if (!filledLines.length) return { result: [...perms], sources: [] };

	const result: ROPuzzleSymbolLine[] = [];
	const sources: LineId[] = [];

	for (const perm of perms) {
		const dupeFound = filledLines.find(l => areLinesEqual(perm, l.values));
		if (dupeFound) {
			sources.push(dupeFound.lineId);
		} else {
			result.push(perm);
		}
	}

	return { result, sources };
}

export function getRecurringValuesFromPermutations(boardLine: BoardLine, permutations: LineArrSymbolPermutations) {
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