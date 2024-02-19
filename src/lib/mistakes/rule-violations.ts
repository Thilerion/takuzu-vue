import type { BoardLine } from "../board/BoardLine.js";
import type { BoardAndSolutionBoards } from "../types.js";
import { hasIncorrectValues } from "./incorrect-values.js";
import type { RuleViolation } from "./types.js";
import { findBalancedLinesRuleViolations } from "./violations/balanced-line-violation.js";
import { findMaxConsecutiveRuleViolations } from "./violations/max-consecutive-violation.js";
import { findUniqueLinesRuleViolations } from "./violations/unique-lines-violation.js";

export function findRuleViolations(
	{ board, solution }: BoardAndSolutionBoards
): {
	hasIncorrectValues: boolean,
	hasRuleViolations: false,
	results: never[]
} | {
	hasIncorrectValues: true,
	hasRuleViolations: true,
	results: RuleViolation[]
} {
	const results: RuleViolation[] = [];
	if (!hasIncorrectValues({ board, solution })) return {
		hasIncorrectValues: false as const,
		hasRuleViolations: false as const,
		results: [] as never[]
	}

	const boardLines = [...board.boardLines()]
	const getBoardLines = (): BoardLine[] => boardLines;
	
	results.push(
		// find maxConsecutive rule violations
		...findMaxConsecutiveRuleViolations(getBoardLines, solution),
		// find balancedLines rule violations
		...findBalancedLinesRuleViolations(getBoardLines, solution),
		// find uniqueLines rule violations
		...findUniqueLinesRuleViolations(getBoardLines, solution)
	)
	
	// Possible that no results were found when the incorrect values cannot easily be attributed to a rule violation.
	if (results.length === 0) return {
		hasIncorrectValues: true as const,
		hasRuleViolations: false as const,
		results: [] as never[]
	}

	return {
		hasIncorrectValues: true as const,
		hasRuleViolations: true as const,
		results
	}
}