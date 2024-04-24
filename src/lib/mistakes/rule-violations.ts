import type { BoardLine } from "../board/BoardLine.js";
import type { BoardAndSolutionBoards, LineId, XYKey } from "../types.js";
import { hasIncorrectValues } from "./incorrect-values.js";
import type { BalancedLinesRuleViolation, FoundIncorrectValue, RuleViolation, RuleViolationType, UniqueLinesRuleViolation } from "./types.js";
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
		// TODO: (optionally?) also get uniqueLines rule violations when both the target and reference lines have incorrect values
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

/**
 * Get a filtered set of rule violations, with unnecessary violations removed, based on the other rule violations.
 * 
 * For instance: a uniqueLines rule violation is unnecessary if the line has mistakes that are also in a "maxConsecutive"
 * violation, or if the line is also in a "balancedLines" violation.
 * 
 * Another example is of an unnecessary violation is a balancedLines rule violation where all of its
 * incorrect values are also in a "maxConsecutive" violation.
 * 
 * @param violations - The array of rule violations to filter.
 * @param byType - Optionally, the grouped rule violations by type.
 * @returns The filtered rule violations, as an array of all violations, and grouped by type of violation.
 */
export const filterUnnecessaryRuleViolations = (
	violations: ReadonlyArray<RuleViolation>,
	byType: RuleViolationsByTypeRecord = groupRuleViolationResultsByType([...violations])
): { violations: RuleViolation[], byType: RuleViolationsByTypeRecord } => {

	if (!violations.length) return { violations: [], byType: { ...byType } };

	const { maxConsecutive, balancedLines, uniqueLines } = byType;
	const hasType: Record<RuleViolationType, boolean> = {
		maxConsecutive: maxConsecutive.length > 0,
		balancedLines: balancedLines.length > 0,
		uniqueLines: uniqueLines.length > 0
	}

	// If there is only one type of violation, return that type of violation
	const singleTypeViolations = returnSingleTypeViolations(byType, hasType);
	if (singleTypeViolations) return singleTypeViolations;

	// The resulting "byType" object, where the filtered violations will be stored
	const filtered: RuleViolationsByTypeRecord = {
		maxConsecutive: [...maxConsecutive],
		balancedLines: [...balancedLines],
		uniqueLines: [...uniqueLines]
	}
	
	// Get all (unique) items in "maxConsecutive" violations' "incorrectCells" array, as FoundIncorrectValue[] and as XYKey[], and
	// and get all (unique) lineIds in all "balancedLines" violations
	const maxConsecutiveIncorrectValues = toUniqueIncorrectValues(
		filtered.maxConsecutive.flatMap(v => v.incorrectCells)
	);
	const maxConsecutiveIncorrectValueKeys = new Set<XYKey>(maxConsecutiveIncorrectValues.map(v => `${v.x},${v.y}` as const));
	const balancedLinesLineIds = new Set(filtered.balancedLines.map(v => v.lineId));

	// Discard uniqueLines violations that are not necessary due to maxConsecutive and balancedLines violations
	filtered.uniqueLines = discardUnnecessaryUniqueLinesViolations(
		filtered.uniqueLines,
		maxConsecutiveIncorrectValueKeys,
		balancedLinesLineIds
	);

	// Discard balancedLines violations if all their incorrect values are also in the maxConsecutive violations
	filtered.balancedLines = discardBalancedLinesViolationsDueToMaxConsecutive(
		filtered.balancedLines,
		maxConsecutiveIncorrectValueKeys
	);

	/*
	TODO: are there more ways to remove violations that are not necessary anymore?
	Maybe remove maxConsecutives if there is a balancedlines violation in a line that is completely filled,
	and not entirely due to the maxConsecutive violations?
	*/
	return {
		violations: [
			...filtered.maxConsecutive,
			...filtered.balancedLines,
			...filtered.uniqueLines
		],
		byType: filtered
	}
}

/**
 * Filters out duplicate incorrect values based on their coordinates.
 * Returns an array of unique incorrect values.
 *
 * @param incorrectCells - The array of incorrect values.
 * @returns An array of unique incorrect values.
 */
function toUniqueIncorrectValues(
	incorrectCells: FoundIncorrectValue[]
): FoundIncorrectValue[] {
	const foundXY = new Set<XYKey>();
	const result: FoundIncorrectValue[] = [];

	for (const item of incorrectCells) {
		const key: XYKey = `${item.x},${item.y}`;
		if (foundXY.has(key)) continue;

		foundXY.add(key);
		result.push(item);
	}
	return result;
}

/**
 * Discards unnecessary UniqueLinesRuleViolations from the provided array.
 * A violation is considered unnecessary if:
 * 1. Its "incorrectLine" array contains a line that is also targeted by the "balancedLines" violations, or
 * 2. Its "incorrectValues" array contains a x,y pair that is also in one of "maxConsecutive" violations' "incorrectCells" array.
 * 
 * @param violations - The array of UniqueLinesRuleViolations to filter.
 * @param maxConsecutiveIncorrectValueKeys - The set of x,y keys of the incorrect values in every "maxConsecutive" violation.
 * @param balancedLinesLineIds - The set of lineIds in all "balancedLines" violations.
 * @returns The filtered array of UniqueLinesRuleViolations.
 */
function discardUnnecessaryUniqueLinesViolations(
	violations: UniqueLinesRuleViolation[],
	maxConsecutiveIncorrectValueKeys: Set<XYKey>,
	balancedLinesLineIds: Set<LineId>
): UniqueLinesRuleViolation[] {
	return violations.filter(v => {
		if (v.incorrectLines.some(l => balancedLinesLineIds.has(l))) return false;
		if (v.incorrectCells.some(c => maxConsecutiveIncorrectValueKeys.has(`${c.x},${c.y}` as const))) return false;
		return true;
	})
}

/**
 * Discards balanced lines violations when all their incorrect values are (also) due to a maxConsecutive violation.
 * 
 * @param violations - The array of balancedLines rule violations.
 * @param maxConsecutiveIncorrectValueKeys - The set of all x,y keys of the incorrect values in every maxConsecutive violation.
 * @returns The filtered array of balancedLines rule violations.
 */
function discardBalancedLinesViolationsDueToMaxConsecutive(
	violations: BalancedLinesRuleViolation[],
	maxConsecutiveIncorrectValueKeys: Set<XYKey>
) {
	return violations.filter(v => {
		const { incorrectCells } = v;
		const incorrectCellKeys = incorrectCells.map(c => `${c.x},${c.y}` as const);
		// Check if every value in "incorrectCells" is also in "maxConsecutiveIncorrectValueKeys"
		// If so, this balancedLines violation can be discarded
		return !incorrectCellKeys.every(key => maxConsecutiveIncorrectValueKeys.has(key));
	});
}

/**
 * Returns a single type of rule violations if there is only one type of violation.
 * Otherwise, returns null if there is more than one type of violation.
 */
function returnSingleTypeViolations(
	byType: RuleViolationsByTypeRecord,
	hasType: Record<RuleViolationType, boolean>
): null | ReturnType<typeof filterUnnecessaryRuleViolations> {
	if (hasType.maxConsecutive && !hasType.balancedLines && !hasType.uniqueLines) {
		return { violations: [...byType.maxConsecutive], byType: { ...byType } };
	} else if (!hasType.maxConsecutive && hasType.balancedLines && !hasType.uniqueLines) {
		return { violations: [...byType.balancedLines], byType: { ...byType } };
	} else if (!hasType.maxConsecutive && !hasType.balancedLines && hasType.uniqueLines) {
		return { violations: [...byType.uniqueLines], byType: { ...byType } };
	}
	// There are multiple types of violations, so return null and let the caller handle it
	return null;
}