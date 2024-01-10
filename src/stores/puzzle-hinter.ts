import { humanSolveBalance, humanSolveDuplicateLine, humanSolveElimination, humanSolveTriples } from "@/lib/human-solver";
import { Hint, HINT_TYPE } from "./hints/Hint.js";
import { createHint, validateHint } from "./hints/index.js";
import { defineStore } from "pinia";
import { usePuzzleStore } from "./puzzle.js";
import { useHintHighlightsStore } from "./highlight-store.js";
import type { BoardString } from "@/lib/types";
import type { SimpleBoard } from "@/lib/index";

export const usePuzzleHintsStore = defineStore('puzzleHints', {

	state: () => ({
		showHint: false,
		currentHint: null as null | Hint,
		currentHintValidForBoardStr: null as null | BoardString,

		cache: new Map<BoardString, (null | Hint)>()
	}),

	getters: {
		baseHintsRequested: state => state.cache.size,
		hintAssistanceData() {
			const amountRequested = this.baseHintsRequested;
			return { amountRequested };
		},
	},
	
	actions: {
		hide() {
			const hintHighlightsStore = useHintHighlightsStore();
			hintHighlightsStore.hide();

			if (!this.showHint) {
				return;
			}
			this.showHint = false;
		},
		show() {
			if (this.currentHint == null) {
				console.warn('Cannot show hint as there is no current hint set. Will hide hint and highlights instead.');
				return this.hide();
			}

			const hintHighlightsStore = useHintHighlightsStore();
			hintHighlightsStore.show();
			this.showHint = true;
		},
		removeHint() {
			this.currentHint = null;
			this.currentHintValidForBoardStr = null;
			this.showHint = false;
			const hintHighlightsStore = useHintHighlightsStore();
			hintHighlightsStore.clear();
		},
		showNewHint(hint: Hint) {
			this.currentHint = hint;
			this.currentHintValidForBoardStr = this._getBoardStr() ?? null;
			this.showHint = true;
			const hintHighlightsStore = useHintHighlightsStore();
			hintHighlightsStore.displayFromHint(hint);
		},

		// original mutations
		reset() {
			this.$reset();
			const hintHighlightsStore = useHintHighlightsStore();
			hintHighlightsStore.reset();
		},
		
		// original actions
		getHint() {
			const puzzleStore = usePuzzleStore();
			const boardStr = puzzleStore.boardStr!;
			const cacheResult = this.cache.get(boardStr);
			if (cacheResult && this.currentHint != null && this.currentHintValidForBoardStr === this._getBoardStr()) {
				this.show();
				return;
			} else if (cacheResult) {
				this.showNewHint(cacheResult);
				return;
			}
			// TODO: remove cast when puzzleStore is converted to TS
			const board = puzzleStore.board as unknown as SimpleBoard;
			const solution = puzzleStore.solution as unknown as SimpleBoard;
			const currentHint = this.currentHint;
			if (currentHint) {
				const isValid = validateHint(currentHint);
				if (isValid) {
					console.log('Hint is still valid. Showing it now.');
					this.show();
					return;
				} else {
					console.log('Hint is no longer valid. Will remove it and generate a new hint.');
					this.removeHint();
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
				const hint = createHint(HINT_TYPE.MISTAKE, incorrectValues);
				this.setHints([hint]);
				return;
			}

			// 2: Run HumanSolver to find all possible moves to make right now (probably only the easiest strategy)
			// findAllAvailableMoves({ board, solution });

			// TRIPLES HINT
			const triplesHumanResult = humanSolveTriples({ board });
			if (triplesHumanResult && triplesHumanResult.length) {
				const triplesHints = triplesHumanResult.map(triplesResult => {
					return createHint(HINT_TYPE.TRIPLES, triplesResult);
				})
				
				const sortedHints = triplesHints.sort((a, b) => {
					const { subType: typeA } = a;
					const { subType: typeB } = b;
					if (typeA === 'double' && typeB === 'sandwich') return -1;
					if (typeA === 'sandwich' && typeB === 'double') return 1;
					return b.targets.length - a.targets.length;
				})
				const hint = sortedHints[0];
				this.setHints([hint]);
				return;
			}

			// BALANCE HINT
			const balanceHintResult = humanSolveBalance({ board });
			if (balanceHintResult && balanceHintResult.length) {
				const hint = createHint(HINT_TYPE.BALANCE, balanceHintResult[0]);
				this.setHints([hint]);
				return;
			}

			// ELIMINATION HINT
			const eliminationHintResult = humanSolveElimination({ board });
			if (!Array.isArray(eliminationHintResult)) {
				const err = eliminationHintResult.error;
				throw new Error(`Elimination Technique returned an error, but the mistakes checker found none. This should not be possible. Error: ${err}`);
			}
			if (eliminationHintResult.length) {
				const sorted = [...eliminationHintResult].sort((a, b) => {
					if (a.elimType === b.elimType) {
						return 0;
					} else if (a.elimType > b.elimType) {
						return 1;
					} else return -1;
				})
				const hint = createHint(HINT_TYPE.ELIMINATION, sorted[0]);
				this.setHints([hint]);
				return;
			}

			// ELIMINATION/DUPE HINT
			const dupeHintResult = humanSolveDuplicateLine({ board });
			if (!Array.isArray(dupeHintResult)) {
				const err = dupeHintResult.error;
				throw new Error(`DuplicateLine Technique returned an error, but the mistakes checker found none. This should not be possible. Error: ${err}`);
			}
			if (dupeHintResult.length) {
				const sorted = [...dupeHintResult].sort((a, b) => {
					if (a.elimType === b.elimType) {
						return 0;
					} else if (a.elimType > b.elimType) {
						return 1;
					} else return -1;
				})
				const hint = createHint(HINT_TYPE.ELIM_DUPE, sorted[0]);
				this.setHints([hint]);
				return;
			}

			console.warn('SHOULD RUN HUMAN SOLVER NOW, BUT IS NOT YET IMPLEMENTED');


			// TODO: not yet implemented hinting system
			this.setHints();
		},

		setHints(hints: Hint[] = []) {
			// TODO: pick one single hint from a list of hints
			if (hints.length === 0) {
				console.warn('SetHints was called, but there were no hints in the array. Seems like there are no valid hints for this board state.');
				this.removeHint();
				// still add to cache, because no hint being available is also worth caching
				this.addNoHintAvailableToCache();
			} else {
				const hint = hints[0];
				this.showNewHint(hint);
				this.addHintToCache({ hint });
				return;
			}
		},

		_getBoardStr(): BoardString {
			return usePuzzleStore().boardStr!;
		},

		addHintToCache({
			hint, boardStr
		}: { hint: Hint, boardStr?: BoardString }) {
			const _boardStr: BoardString = boardStr ?? this._getBoardStr();
			this.cache.set(_boardStr, hint);
		},
		addNoHintAvailableToCache(boardStr?: BoardString) {
			this.cache.set(boardStr ?? this._getBoardStr(), null);
		}
	}

})