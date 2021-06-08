import { humanSolveBalance } from "@/lib/human-solver/balance";
import { humanSolveDuplicateLine } from "@/lib/human-solver/duplicate";
import { humanSolveElimination } from "@/lib/human-solver/elimination";
import { humanSolveTriples } from "@/lib/human-solver/triples";
import { createHint, validateHint } from "../hints/";
import hintTypes from "../hints/hint-types";

const defaultState = () => ({
	showHint: false,
	currentHint: null,

	cache: new Map(),
});

const assistanceHintModule = {
	state: defaultState(),

	getters: {
		baseHintsRequested: state => state.cache.size,
		hintAssistanceData: (state, getters) => {
			const amountRequested = getters.baseHintsRequested;
			return { amountRequested };
		},
	},

	mutations: {
		reset: state => {
			Object.assign(state, defaultState());
		},
		setHintVisible(state, value) {
			state.showHint = !!value;
		},
		setCurrentHint(state, hint = null) {
			state.currentHint = hint;
		},
		removeHints(state) {
			state.currentHint = null;
			state.showHint = false;
		},
		addHintToCache(state, { boardStr, hint }) {
			state.cache.set(boardStr, hint);
		}
	},

	actions: {
		getHint({ state, rootState, rootGetters, commit, dispatch }) {
			const boardStr = rootGetters['puzzle/boardStr'];
			let result = state.cache.get(boardStr);
			if (result) {
				console.log('using cached hint result');
				commit('setCurrentHint', result);
				commit('setHintVisible', true);
				return;
			}

			const { board, solution } = rootState.puzzle;
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
				commit('addHintToCache', { boardStr, hint});
				return;
			}

			// 2: Run HumanSolver to find all possible moves to make right now (probably only the easiest strategy)
			// findAllAvailableMoves({ board, solution });

			// TRIPLES HINT
			const triplesHumanResult = humanSolveTriples({ board });
			if (triplesHumanResult && triplesHumanResult.length) {
				const triplesHints = triplesHumanResult.map(triplesResult => {
					return createHint(hintTypes.TRIPLES, triplesResult);
				})
				console.log({ triplesHints });
				
				const sortedHints = triplesHints.sort((a, b) => {
					const { subType: typeA } = a;
					const { subType: typeB } = b;
					if (typeA === 'double' && typeB === 'sandwich') return -1;
					if (typeA === 'sandwich' && typeB === 'double') return 1;
					return b.targets.length - a.targets.length;
				})
				const hint = sortedHints[0];
				console.log({ hint });
				dispatch('setHints', [hint]);
				commit('addHintToCache', { boardStr, hint});
				return;
			}

			// BALANCE HINT
			const balanceHintResult = humanSolveBalance({ board });
			if (balanceHintResult && balanceHintResult.length) {
				const hint = createHint(hintTypes.BALANCE, balanceHintResult[0]);
				console.log({ hint });
				dispatch('setHints', [hint]);
				commit('addHintToCache', { boardStr, hint});
				return;
			}

			// ELIMINATION HINT
			const eliminationHintResult = humanSolveElimination({ board });
			if (eliminationHintResult && eliminationHintResult.length) {
				const sorted = [...eliminationHintResult].sort((a, b) => {
					if (a.elimType === b.elimType) {
						return 0;
					} else if (a.elimType > b.elimType) {
						return 1;
					} else return -1;
				})
				const hint = createHint(hintTypes.ELIMINATION, sorted[0]);
				console.log({ eliminationHintResult, sorted, hint });
				dispatch('setHints', [hint]);
				commit('addHintToCache', { boardStr, hint});
				return;
			}

			// ELIMINATION/DUPE HINT
			const dupeHintResult = humanSolveDuplicateLine({ board });
			console.log({ dupeHintResult });
			if (dupeHintResult && dupeHintResult.length) {
				const sorted = [...dupeHintResult].sort((a, b) => {
					if (a.elimType === b.elimType) {
						return 0;
					} else if (a.elimType > b.elimType) {
						return 1;
					} else return -1;
				})
				console.log('DUPE HINTS!')
				const hint = createHint(hintTypes.ELIM_DUPE, sorted[0]);
				console.log({ dupeHintResult, sorted, hint });
				dispatch('setHints', [hint]);
				commit('addHintToCache', { boardStr, hint});
				return;
			}

			console.warn('SHOULD RUN HUMAN SOLVER NOW, BUT IS NOT YET IMPLEMENTED');


			// TODO: not yet implemented hinting system
			dispatch('setHints');
			commit('addHintToCache', { boardStr, hint});
		},
		setHints({ commit }, hints = []) {
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

export default assistanceHintModule;