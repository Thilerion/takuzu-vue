import type { BoardLine } from "../board/BoardLine.js";
import type { BoardAndSolutionBoards } from "../types.js";
import { hasIncorrectValues } from "./incorrect-values.js";
import type { RuleViolation, RuleViolationType } from "./types.js";
import { findBalancedLinesRuleViolations } from "./violations/balanced-line-violation.js";
import { findMaxConsecutiveRuleViolations } from "./violations/max-consecutive-violation.js";
import { findUniqueLinesRuleViolations } from "./violations/unique-lines-violation.js";

/**
 * Find rule violations in the board.
 * It first checks if there are incorrect values doing a quick comparison, and if there are none, there are no rule violations either.
 * If there are incorrect values, it searches for rule violations. It returns either a list of rule violations, or no rule violations of the incorrect values cannot be attributed to a rule violation.
 */
export function findRuleViolations(
	{ board, solution }: BoardAndSolutionBoards
): {
	hasIncorrectValues: boolean,
	hasRuleViolations: false,
	results: []
} | {
	hasIncorrectValues: true,
	hasRuleViolations: true,
	results: RuleViolation[]
} {
	if (!hasIncorrectValues({ board, solution })) return {
		hasIncorrectValues: false as const,
		hasRuleViolations: false as const,
		results: [] as const
	}

	const boardLines = [...board.boardLines()]
	const getBoardLines = (): BoardLine[] => boardLines;

	const results: RuleViolation[] = [
		...findMaxConsecutiveRuleViolations(getBoardLines, solution),
		...findBalancedLinesRuleViolations(getBoardLines, solution),
		...findUniqueLinesRuleViolations(getBoardLines, solution)
	];
	
	// Possible that no results were found when the incorrect values cannot easily be attributed to a rule violation.
	if (results.length === 0) return {
		hasIncorrectValues: true as const,
		hasRuleViolations: false as const,
		results: [] as const
	}

	return {
		hasIncorrectValues: true as const,
		hasRuleViolations: true as const,
		results
	}
}

export type RuleViolationsByTypeRecord = {
	[Type in RuleViolationType]: Extract<RuleViolation, { type: Type }>[]
}
export const groupRuleViolationResultsByType = (results: RuleViolation[]): RuleViolationsByTypeRecord => {
	const result: RuleViolationsByTypeRecord = {
		maxConsecutive: [],
		balancedLines: [],
		uniqueLines: [],
	}

	for (const violation of results) {
		result[violation.type].push(violation as never);
	}

	return result;
}