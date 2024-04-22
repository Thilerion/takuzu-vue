import { defineStore } from "pinia";
import { usePuzzleStore } from "../puzzle/store.js";
import { findIncorrectValuesFromSolution, hasIncorrectValues } from "@/lib/mistakes/incorrect-values.js";
import type { FoundIncorrectValue } from "@/lib/mistakes/types.js";
import { useSettingsStore } from "../settings/store.js";
import { usePuzzleVisualCuesStore } from "../puzzle-visual-cues.js";

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
	violations: never[];
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
			console.warn('Rule violations user check not yet implemented');
			this.setRuleViolationMarks();
			return { isValid: false };
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
			console.error('SetRuleViolationMarks not yet implemented');
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