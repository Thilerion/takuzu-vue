import { defineStore } from "pinia";
import { usePuzzleStore } from "../puzzle/store.js";
import { findIncorrectValuesFromSolution } from "@/lib/mistakes/incorrect-values.js";
import type { FoundIncorrectValue, RuleViolation } from "@/lib/mistakes/types.js";
import { useSettingsStore } from "../settings/store.js";
import { usePuzzleVisualCuesStore } from "../puzzle-visual-cues.js";
import { findRuleViolations } from "@/lib/mistakes/rule-violations.js";
import { pickRandom } from "@/utils/random.utils.js";
import { createAreaHighlightFromCorners, createLineHighlightFromLineId } from "@/helpers/puzzle-visual-cues.js";

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
			// console.warn('Rule violations user check not yet implemented');
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
		setRuleViolationMarks() {
			// TODO: determine which rule violations to mark; if a line has a maxConsecutive violation and a balance violation, prefer the maxConsecutive only if the line is not filled
			// TODO: currently only marks one result
			const visualCuesStore = usePuzzleVisualCuesStore();
			if (!this.lastValidation.found) {
				visualCuesStore.clearHighlightsFromRuleViolations();
				return;
			} else if (this.lastValidation.type !== 'ruleViolations') return;

			const violations = this.lastValidation.violations;
			console.log(violations);
			const random = pickRandom(violations);
			const puzzleStore = usePuzzleStore();
			const boardShape = {
				width: puzzleStore.width!,
				height: puzzleStore.height!
			};
			switch(random.type) {
				case 'balancedLines': {
					visualCuesStore.setRuleViolationHighlights([
						createLineHighlightFromLineId(random.lineId, boardShape, { colorId: 1, source: 'ruleViolationCheck' })
					]);
					return;
				}
				case 'maxConsecutive': {
					const cells = random.cells;
					const xes = cells.map(c => c.x);
					const ys = cells.map(c => c.y);
					const start = {
						x: Math.min(...xes),
						y: Math.min(...ys)
					}
					const end = {
						x: Math.max(...xes),
						y: Math.max(...ys)
					}
					visualCuesStore.setRuleViolationHighlights([
						createAreaHighlightFromCorners(start, end, { colorId: 1, source: 'ruleViolationCheck' })
					]);
					return;
				}
				case 'uniqueLines': {
					visualCuesStore.setRuleViolationHighlights([
						createLineHighlightFromLineId(random.correctLine, boardShape, { colorId: 1, source: 'ruleViolationCheck' }),
						...random.incorrectLines.map(l => createLineHighlightFromLineId(l, boardShape, { colorId: 2, source: 'ruleViolationCheck' }))
					]);
					return;
				}
				default: {
					const _x: never = random;
					console.error(`Unhandled rule violation type: ${(random as any)?.type}`);
					return;
				}
			}
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
	return { type: 'ruleViolations', found: true, violations: results };
}