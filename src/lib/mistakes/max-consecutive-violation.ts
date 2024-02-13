import type { BoardLine } from "../board/BoardLine.js";
import { ZERO, ONE, type PuzzleSymbol } from "../constants.js";
import type { SimpleBoard } from "../index.js";
import type { Target } from "../types.js";
import type { FoundIncorrectValue, MaxConsecutiveRuleViolation } from "./types.js";

const threeInARowRegex = new RegExp(`${ZERO}{3,}|${ONE}{3,}`, 'g');

// gather all groups of cells of the same symbol, with at least 3 in a row
// then, for each group, collect the cells in the group that are incorrect according to the solution

export function findMaxConsecutiveRuleViolations(
	getBoardLines: () => Iterable<BoardLine>,
	solution: SimpleBoard
): MaxConsecutiveRuleViolation[] {
	const results: MaxConsecutiveRuleViolation[] = [];
	
	for (const boardLine of getBoardLines()) {
		const lineStr = boardLine.toString();
		const threeInARowMatches = [...lineStr.matchAll(threeInARowRegex)];
		for (const group of threeInARowMatches) {
			if (group.index == null) continue;
			const idx = group.index;
			const length = group[0].length;
			const cells: Target[] = [];
			for (let i = idx; i < idx + length; i++) {
				cells.push({
					...boardLine.getCoords(i),
					value: lineStr[i] as PuzzleSymbol
				});
			}
			const incorrectCells: FoundIncorrectValue[] = [];
			for (const { x, y, value } of cells) {
				const solutionValue = solution.get(x, y) as PuzzleSymbol;
				if (solutionValue !== value) {
					incorrectCells.push({ x, y, current: value, correctValue: solutionValue });
				}
			}
			results.push({ type: 'maxConsecutive', cells, incorrectCells });
		}
	}
	return results;
}