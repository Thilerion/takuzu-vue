import { humanSolveBalance } from "@/lib/human-solver/balance.js";
import { humanSolveDuplicateLine } from "@/lib/human-solver/duplicate.js";
import { humanSolveElimination } from "@/lib/human-solver/elimination.js";
import { humanSolveTriples } from "@/lib/human-solver/triples.js";
import hintTypes from "@/store/hints/hint-types.js";
import { createHint, validateHint } from "@/store/hints/index.js";
import { defineStore } from "pinia";
import { usePuzzleStore } from "./puzzle-old.js";

export const usePuzzleHintsStore = defineStore('puzzleHints', {

	state: () => ({
		showHint: false,
		currentHint: null,

		cache: new Map()
	}),

	getters: {
		baseHintsRequested: state => state.cache.size,
		hintAssistanceData() {
			const amountRequested = this.baseHintsRequested;
			return { amountRequested };
		},
	},
	
	actions: {
		// original mutations
		reset() {
			this.$reset();
		},
		
		// original actions
		getHint() {
			const puzzleStore = usePuzzleStore();
			const boardStr = puzzleStore.boardStr;
			const cacheResult = this.cache.get(boardStr);
			if (cacheResult) {
				console.log('using cached hint result');
				this.$patch({
					showHint: true,
					currentHint: cacheResult
				});
				return;
			}
			const board = puzzleStore.board;
			const solution = puzzleStore.solution;
			const currentHint = this.currentHint;
			if (currentHint) {
				const isValid = validateHint(currentHint, { board, solution });
				if (isValid) {
					console.log('Hint is still valid. Showing it now.');
					this.showHint = true;
					return;
				} else {
					console.log('Hint is no longer valid. Will remove it and generate a new hint.');
					this.currentHint = null;
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
				this.setHints([hint]);
				this.addHintToCache({ boardStr, hint });
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
				this.setHints([hint]);
				this.addHintToCache({ boardStr, hint });
				return;
			}

			// BALANCE HINT
			const balanceHintResult = humanSolveBalance({ board });
			if (balanceHintResult && balanceHintResult.length) {
				const hint = createHint(hintTypes.BALANCE, balanceHintResult[0]);
				console.log({ hint });
				this.setHints([hint]);
				this.addHintToCache({ boardStr, hint });
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
				this.setHints([hint]);
				this.addHintToCache({ boardStr, hint });
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
				this.setHints([hint]);
				this.addHintToCache({ boardStr, hint });
				return;
			}

			console.warn('SHOULD RUN HUMAN SOLVER NOW, BUT IS NOT YET IMPLEMENTED');


			// TODO: not yet implemented hinting system
			this.setHints();
			this.addHintToCache({ boardStr, hint: null });
		},

		setHints(hints = []) {
			if (hints.length === 0) {
				console.warn('No hint in hints array?');
				this.$patch({
					currentHint: null,
					showHint: true
				})
			} else if (hints.length === 1) {
				this.$patch({
					currentHint: hints[0],
					showHint: true
				})
			} else {
				console.warn('No functionality yet for picking a single hint from the list of hints...');
				this.$patch({
					currentHint: hints[0],
					showHint: true
				})
			}
		},

		addHintToCache({ boardStr, hint }) {
			this.cache.set(boardStr, hint);
		}
	}

})