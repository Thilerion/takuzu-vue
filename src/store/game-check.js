import { findRuleConflicts } from "@/lib/validate/board";

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
		},
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
	},

	actions: {
		findIncorrectValues({ rootState, commit }) {
			console.log('running find incorrect values');
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
			console.log('running find rule violations');
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
		getHint({ commit, dispatch, state }) {
			// TODO: not yet implemented hinting system
			console.warn('Hints not yet implemented');
			commit('setHintVisible', true);
		},
	}

}

export default gameCheckModule;