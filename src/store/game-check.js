import { findRuleConflicts } from "@/lib/validate/board";
import { createHint, validateHint } from "./hints";
import hintTypes from "./hints/hint-types";

const gameCheckModule = {

	namespaced: true,

	state: () => ({

		checkErrorResult: null,
		
		showIncorrectValues: true,
		showRuleViolations: true,

		incorrectValues: [],
		ruleViolations: [],

		allHints: [],
		currentHint: null,

		showHint: false,
	}),

	getters: {
		markedIncorrectValues(state) {
			return state.showIncorrectValues ? state.incorrectValues : [];
		},
		markedRuleViolations(state) {
			return state.showRuleViolations ? state.ruleViolations : [];
		}
	},

	mutations: {
		setCheckErrorResult(state, result) {
			state.checkErrorResult = result;
		},
		setIncorrectValues(state, values = []) {
			state.incorrectValues = values;
		},
		setRuleViolations(state, values = []) {
			state.ruleViolations = values;
		},
		
		// HINTS
		setHintVisible(state, value) {
			state.showHint = !!value;
		},
		setAllHints(state, hints) {
			state.allHints = hints;
		},
		setCurrentHint(state, hint = null) {
			state.currentHint = hint;
		},
		removeHints(state) {
			state.allHints = [];
			state.currentHint = null;
			state.showHint = false;
		}
	},

	actions: {
		findIncorrectValues({ rootState, commit }) {
			const { board, solution } = rootState.game;

			const { hasMistakes, result } = board.hasIncorrectValues(solution);
			
			if (!hasMistakes) {
				commit('setIncorrectValues', []);
				return false;
			}

			const incorrectCellIds = result.map(({ x, y }) => `${x},${y}`);
			commit('setIncorrectValues', incorrectCellIds);
			return true;
		},
		findRuleViolations({ rootState, commit }) {
			const { board } = rootState.game;

			const violations = findRuleConflicts(board, true);
			
			if (!violations || !violations.length) {
				commit('setRuleViolations', []);
				return false;
			}

			// TODO: map rule conflicts to something more usable
			commit('setRuleViolations', violations);
			return true;
		},

		// HINTS
		getHint({ state, rootState, commit, dispatch }) {
			const { board, solution } = rootState.game;
			// FIRST: check if current hint and if so, if it is still valid
			// because in that case, it should be shown without "using up a new generated hint"
			const currentHint = state.currentHint;
			if (currentHint) {
				const isValid = validateHint(currentHint, { board, solution });
				if (isValid) {
					console.log('Hint is still valid. Showing it now.');
					commit('setHintVisible', true);
					return;
				} else {
					console.log('Hint is no longer valid. Will remove it and generate a new hint.');
					commit('setCurrentHint', null);
				}
			}
			console.log('start hint gen');
			

			// 1: check if there are incorrect values
			// 1a: if yes, check if there are rule violations
			// 1b: is all incorrect values are due to rule violations, show ruleViolation hint
			// 1c: if not all incorrect due to RV, are no RV at all, show IncorrectValue hint

			// TODO: would be best to compare incorrect values and rule violatoins, but for now, just check incorrect vlaues

			const {
				hasMistakes,
				result: incorrectValues
			} = board.hasIncorrectValues(solution);
			if (hasMistakes) {
				const hint = createHint(hintTypes.MISTAKE, incorrectValues);
				console.log({ hint });
				dispatch('setHints', [hint]);
				return;
			}

			// 2: Run HumanSolver to find all possible moves to make right now (probably only the easiest strategy)
			console.warn('SHOULD RUN HUMAN SOLVER NOW, BUT IS NOT YET IMPLEMENTED');


			// TODO: not yet implemented hinting system
			dispatch('setHints');
		},
		setHints({ commit }, hints = []) {
			commit('setAllHints', hints);
			if (hints.length === 0) {
				console.warn('No hint in hints array?');
				commit('setCurrentHint', null);
			} else if (hints.length === 1) {
				commit('setCurrentHint', hints[0]);
			} else {
				console.warn('No functionality yet for picking a single hint from the list of hints...');
				commit('setCurrentHint', hints[0]);
			}
			commit('setHintVisible', true);
		}
	}

}

export default gameCheckModule;