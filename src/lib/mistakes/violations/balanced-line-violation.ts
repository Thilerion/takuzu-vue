import { BoardLine } from "@/lib/board/BoardLine.js";
import { ZERO, ONE, type PuzzleSymbol } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import type { BalancedLinesRuleViolation, FoundIncorrectValue } from "../types.js";

export function findBalancedLinesRuleViolations(
	getBoardLines: () => Iterable<BoardLine>,
	solution: SimpleBoard,
): BalancedLinesRuleViolation[] {
	const results: BalancedLinesRuleViolation[] = [];
	for (const boardLine of getBoardLines()) {
		const remainingCounts = boardLine.countRemaining;

		if (remainingCounts[ZERO] < 0 || remainingCounts[ONE] < 0) {
			results.push(
				getViolationForLine(
					boardLine,
					BoardLine.fromBoard(solution, boardLine.lineId),
					remainingCounts[ZERO] < 0 ? ZERO : ONE
				)
			)
		}
	}
	return results;
}

function getViolationForLine(
	puzzleLine: BoardLine,
	solutionLine: BoardLine,
	symbol: PuzzleSymbol
): BalancedLinesRuleViolation {
	const diff = puzzleLine.diff(solutionLine);
	const incorrectCells: FoundIncorrectValue[] = [];
	for (const { x, y, values } of diff) {
		if (values[0] === symbol) {
			incorrectCells.push({ x, y, current: values[0], correctValue: values[1] as PuzzleSymbol });
		}
	}
	return {
		type: "balancedLines",
		lineId: puzzleLine.lineId,
		incorrectCells,
		symbol,
		amountOver: Math.abs(puzzleLine.countRemaining[symbol])
	};
}