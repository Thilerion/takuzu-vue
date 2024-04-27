import type { SimpleBoard } from "@/lib/board/Board.js";
import { findIncorrectValuesFromSolution } from "@/lib/mistakes/incorrect-values.js";
import { findRuleViolations } from "@/lib/mistakes/rule-violations.js";
import { IncorrectValuesSteppedHint } from "./SteppedHint/IncorrectValuesHint.js";
import type { FoundIncorrectValue, RuleViolation, UniqueLinesRuleViolation } from "@/lib/mistakes/types.js";
import type { XYKey } from "@/lib/types.js";

export function findMistakesHint(board: SimpleBoard, solution: SimpleBoard): IncorrectValuesSteppedHint /*| RuleViolationsSteppedHint */| null {
	const {
		hasIncorrectValues,
		hasRuleViolations,
		results: ruleViolationResults,
	} = findRuleViolations({ board, solution });

	if (!hasIncorrectValues) return null;

	const { results: incorrectValues } = findIncorrectValuesFromSolution({ board, solution });

	// If there are no rule violations, there are only
	// incorrect values without clear rule violation: return IncorrectValuesHint
	if (!hasRuleViolations) {
		return new IncorrectValuesSteppedHint({ incorrectValues });
	}

	// If there are rule violations, check if they completely cover all of the
	// found incorrect values when they are fixed. If so, return a RuleViolationsHint
	if (doRuleViolationsCoverAllIncorrectValues(
		incorrectValues,
		ruleViolationResults,
	)) {
		// TODO: Implement RuleViolationsSteppedHint
		// return new RuleViolationsSteppedHint(ruleViolationResults);
	}

	// RuleViolationHint isn't comprehensive enough, return IncorrectValuesHint
	return new IncorrectValuesSteppedHint({ incorrectValues });
}

/**
 * Check if the RuleViolations completely cover all found incorrect values when they are fixed.
 * In that case, a RuleViolationsHint is the end result. If not, a IncorrectValuesHint is the end result.
 */
function doRuleViolationsCoverAllIncorrectValues(
	incorrectValues: FoundIncorrectValue[],
	ruleViolations: RuleViolation[],
): boolean {
	// If there are UniqueLines rule violations, make sure that at least one of the lines is a correct line
	const uniqueLineViolations = ruleViolations.filter((v): v is UniqueLinesRuleViolation => v.type === 'uniqueLines')
	if (uniqueLineViolations.some(v => v.correctLine === null)) {
		// There is a UniqueLines rule violation where none of the lines are actually correct, so RuleViolations hint wouldn't cover all incorrect values
		return false;
	}

	// Get all incorrect cells from the rule violations. If they cover all cells
	// in the incorrectValues array, the rule violations correctly cover all incorrect values.
	const ruleViolationCoveredMistakes = getAllIncorrectCellsInRuleViolations(ruleViolations);

	if (incorrectValues.every(cell => {
		const key: XYKey = `${cell.x},${cell.y}`;
		return ruleViolationCoveredMistakes.has(key);
	})) {
		return true;
	}

	return false;
}
function getAllIncorrectCellsInRuleViolations(ruleViolations: RuleViolation[]): Set<XYKey> {
	const ruleViolationIncorrectCells = new Set<XYKey>();

	for (const violation of ruleViolations) {
		for (const cell of violation.incorrectCells) {
			const key: XYKey = `${cell.x},${cell.y}`;
			ruleViolationIncorrectCells.add(key);
		}
	}
	return ruleViolationIncorrectCells;
}