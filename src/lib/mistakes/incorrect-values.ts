import type { PuzzleSymbol } from "@/lib/constants.js";
import type { BoardAndSolutionBoards } from "@/lib/types.js";
import type { FoundIncorrectValue } from "./types.js";

/** Generator that yields all incorrect values on the board, comparing it to the solution. */
export function* incorrectValuesFromSolution(
	{ board, solution }: BoardAndSolutionBoards
): Generator<FoundIncorrectValue> {
	for (const cell of board.cells({ skipEmpty: true })) {
		const { x, y, value } = cell;
		const solutionValue = solution.get(x, y) as PuzzleSymbol;
		if (solutionValue !== value) {
			yield { x, y, current: value as PuzzleSymbol, correctValue: solutionValue };
		}
	}
}

/** Finds all incorrect values on the board, comparing it to the solution. */
export function findIncorrectValuesFromSolution(
	{ board, solution }: BoardAndSolutionBoards
): { hasMistakes: boolean, results: FoundIncorrectValue[] } {
	const results: FoundIncorrectValue[] = [...incorrectValuesFromSolution({ board, solution })];
	const hasMistakes = results.length > 0;
	return { hasMistakes, results };
}

/** Performs a quick comparison of the board to the solution, to find if there is at least one incorrect value on the puzzle board. */
export function hasIncorrectValues(boardAndSolution: BoardAndSolutionBoards): boolean {
	return incorrectValuesFromSolution(boardAndSolution).next().value !== undefined;
}