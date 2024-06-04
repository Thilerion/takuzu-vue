import { defineStore } from "pinia";
import { usePuzzleStore } from "../puzzle/store.js";
import { findIncorrectValuesFromSolution } from "@/lib/mistakes/incorrect-values.js";
import type { BalancedLinesRuleViolation, FoundIncorrectValue, MaxConsecutiveRuleViolation, RuleViolation, UniqueLinesRuleViolation } from "@/lib/mistakes/types.js";
import { useSettingsStore } from "../../features/settings/store.js";
import { usePuzzleVisualCuesStore } from "../../features/puzzle-visual-cues/store.js";
import { filterUnnecessaryRuleViolations, findRuleViolations, type RuleViolationsByTypeRecord } from "@/lib/mistakes/rule-violations.js";
import { type PuzzleBoardHighlight, type LineHighlight, createLineHighlightFromLineId, type AreaHighlight, createAreaHighlightFromCorners } from "@/features/puzzle-visual-cues/helpers/highlights.js";

type IncorrectValuesResult = {
	type: 'incorrectValues';
	found: false;
} | {
	type: 'incorrectValues';
	found: true;
	cells: FoundIncorrectValue[];
};
type RuleViolationsResult = {
	type: 'ruleViolations';
	found: false;
} | {
	type: 'ruleViolations';
	found: true;
	violations: RuleViolation[];
	byType: RuleViolationsByTypeRecord;
}
type CheckResultSource = 'user' | 'auto:filledBoard';
export type ValidationCheckResult = (IncorrectValuesResult | RuleViolationsResult) & {
	source: CheckResultSource
}

export const usePuzzleValidationStore = defineStore('puzzleValidation', {
	state: () => ({
		// used to force refresh the checkButton checkmark/cross animation
		userChecks: 0,
		lastValidation: { found: false, type: 'incorrectValues' } as ValidationCheckResult,
		// TODO: previous check results for statistics/score calculation
	}),

	getters: {
		
	},

	actions: {
		userCheck(): null | { isValid: boolean } {
			const settingsStore = useSettingsStore();
			const actionType = settingsStore.checkButton;
			switch(actionType) {
				case 'incorrectValues': {
					this.userChecks += 1;
					return this.incorrectValuesUserCheck();
				}
				case 'ruleViolations': {
					this.userChecks += 1;
					return this.ruleViolationsUserCheck();
				}
				case 'disabled': {
					console.error('Check button is disabled');
					return null;
				}
				default: {
					const x: never = actionType;
					console.error(`Unhandled checkButton action type: ${x}`);
					return null;
				}
			}
		},
		incorrectValuesUserCheck(): { isValid: boolean } {
			// TODO: what to do if the lastValidation was auto:filledBoard? It shouldn't reduce the score, shouldn't count in statistics
			const result = findIncorrectValues();
			this.lastValidation = { ...result, source: 'user' };
			this.setIncorrectValueMarks();
			return { isValid: !result.found };
		},
		ruleViolationsUserCheck(): { isValid: boolean } {
			const result = findCurrentRuleViolations();
			this.lastValidation = { ...result, source: 'user' };
			this.setRuleViolationMarks();
			return { isValid: !result.found };
		},

		filledBoardValidationCheck(): void {
			const result = findIncorrectValues();
			this.lastValidation = { ...result, source: 'auto:filledBoard' };
			this.setIncorrectValueMarks();
		},

		setIncorrectValueMarks() {
			const visualCuesStore = usePuzzleVisualCuesStore();
			visualCuesStore.clearErrorMarks();

			if (this.lastValidation.type !== 'incorrectValues' || !this.lastValidation.found) return;
			visualCuesStore.addErrorMarksFromCells(
				'incorrectValue',
				this.lastValidation.cells.map(cell => ({ x: cell.x, y: cell.y }))
			);
		},
		unsetRuleViolationMarks() {
			const visualCuesStore = usePuzzleVisualCuesStore();
			visualCuesStore.clearHighlightsFromRuleViolations();
			return;
		},
		setRuleViolationMarks() {
			if (!this.lastValidation.found) {
				return this.unsetRuleViolationMarks();
			} else if (this.lastValidation.type !== 'ruleViolations') {
				return;
			} else if (this.lastValidation.violations.length === 0) {
				return this.unsetRuleViolationMarks();
			}

			const violations = this.lastValidation.violations;
			console.log(violations);

			// TODO: better way to mark rule violations and give a message? use a pseudo-hint maybe?
			// for now, mark all violations
			const highlights: PuzzleBoardHighlight[] = [];
			for (const violation of violations) {
				const violationType = violation.type;
				switch(violationType) {
					case 'maxConsecutive': {
						highlights.push(
							createMaxConsecutiveViolationHighlight(violation)
						)
						break;
					}
					case 'balancedLines': {
						highlights.push(
							createBalancedLinesViolationHighlight(violation)
						)
						break;
					}
					case 'uniqueLines': {
						highlights.push(
							...createUniqueLinesViolationHighlights(violation)
						)
						break;
					}
					default: {
						const x: never = violationType;
						console.warn(`Unhandled rule violation type: ${x}`);
						break;
					}
				}
			}
			// TODO: determine when to remove highlights. For now, all these highlights are removed when a value on the board has changed in PuzzleGridHighlights component
			const visualCuesStore = usePuzzleVisualCuesStore();
			visualCuesStore.setRuleViolationHighlights(highlights);
		},

		reset() {
			this.$reset();
		}
	}
})

const findIncorrectValues = (): IncorrectValuesResult => {
	const puzzleStore = usePuzzleStore();
	const board = puzzleStore.board;
	const solution = puzzleStore.solution;
	if (board == null || solution == null) {
		throw new Error('Board or solution is null');
	}
	const {
		hasMistakes,
		results
	} = findIncorrectValuesFromSolution({ board, solution });

	if (!hasMistakes) return { type: 'incorrectValues', found: false as const };
	return { type: 'incorrectValues', found: true , cells: results };
}

const findCurrentRuleViolations = (): RuleViolationsResult => {
	const puzzleStore = usePuzzleStore();
	const board = puzzleStore.board;
	const solution = puzzleStore.solution;
	if (board == null || solution == null) {
		throw new Error('Board or solution is null');
	}
	const { results, hasRuleViolations } = findRuleViolations({ board, solution });
	if (!hasRuleViolations) return { type: 'ruleViolations', found: false as const };

	const {
		violations: filteredViolations,
		byType: filteredViolationsByType
	} = filterUnnecessaryRuleViolations(results);

	return { type: 'ruleViolations', found: true, violations: filteredViolations, byType: filteredViolationsByType };
}

function boardShapeFromStore() {
	const puzzleStore = usePuzzleStore();
	return {
		width: puzzleStore.width!,
		height: puzzleStore.height!
	}
}

function createBalancedLinesViolationHighlight(violation: BalancedLinesRuleViolation): LineHighlight {
	return createLineHighlightFromLineId(
		violation.lineId,
		boardShapeFromStore(),
		{ colorId: 1, source: 'ruleViolationCheck' }
	);
}
function createMaxConsecutiveViolationHighlight(violation: MaxConsecutiveRuleViolation): AreaHighlight {
	const xes = violation.cells.map(c => c.x);
	const ys = violation.cells.map(c => c.y);
	const start = {
		x: Math.min(...xes),
		y: Math.min(...ys)
	}
	const end = {
		x: Math.max(...xes),
		y: Math.max(...ys)
	}
	return createAreaHighlightFromCorners(start, end, { colorId: 1, source: 'ruleViolationCheck' });
}
function createUniqueLinesViolationHighlights(violation: UniqueLinesRuleViolation): LineHighlight[] {
	const { lines } = violation;
	const boardShape = boardShapeFromStore();
	const highlights: LineHighlight[] = lines.map(l => createLineHighlightFromLineId(l, boardShape, { colorId: 1, source: 'ruleViolationCheck' }));
	return highlights;
}