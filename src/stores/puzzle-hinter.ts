import { Hint } from "./hints/Hint.js";
import { validateHint } from "./hints/index.js";
import { defineStore } from "pinia";
import { usePuzzleStore } from "./puzzle.js";
import { useHintHighlightsStore } from "./highlight-store.js";
import type { BoardString } from "@/lib/types";
import { searchForHint } from "./hints/search";

export const usePuzzleHintsStore = defineStore('puzzleHints', {

	state: () => ({
		showHint: false,
		currentHint: null as null | Hint,
		currentHintValidForBoardStr: null as null | BoardString,

		cache: new Map<BoardString, (null | Hint)>()
	}),

	getters: {
		baseHintsRequested: state => state.cache.size,
		hintAssistanceData(): { amountRequested: number } {
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
			this.currentHintValidForBoardStr = usePuzzleStore().boardStr! ?? null;
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

			// First, check if there is a cached hint for this board state
			// If so, show it, to prevent undoing and redoing from showing a different hint
			if (this.showCachedHintIfValid(boardStr)) {
				return;
			}

			// Else, check if there is an active currentHint set.
			// If so, check if it is still valid for the current board state. If not, removeHint and continue.
			const board = puzzleStore.board!;
			const solution = puzzleStore.solution!;
			if (this.validateCurrentHint()) {
				this.show();
				return;
			}

			const hint = searchForHint(board, solution);
			this.setHint(hint);
		},

		validateCurrentHint(): boolean {
			const currentHint = this.currentHint;
			if (!currentHint) return false;

			const isValid = validateHint(currentHint);
			if (isValid) {
				console.log('Hint is still valid. Showing it now.');
				return true;
			} else {
				console.log('Hint is no longer valid. Will remove it and generate a new hint.');
				this.removeHint();
				return false;
			}
		},
		showCachedHintIfValid(boardStr: BoardString): boolean {
			const cacheResult = this.cache.get(boardStr);
			if (!cacheResult) {
				return false;
			}
			if (this.currentHint != null && this.currentHintValidForBoardStr === boardStr) {
				this.show();
				return true;
			} else {
				this.showNewHint(cacheResult);
				return true;
			}
		},

		setHint(hint: Hint | null) {
			if (hint == null) {
				console.log('SetHint was called without a hint; seems like there are no valid hints (found) for this board state.');
				this.removeHint();
				this.addNoHintAvailableToCache();
				return;
			}

			console.log('setting hint');
			console.log({ hint });

			this.showNewHint(hint);
			this.addHintToCache({ hint });
		},

		addHintToCache({
			hint, boardStr
		}: { hint: Hint, boardStr?: BoardString }) {
			const _boardStr: BoardString = boardStr ?? usePuzzleStore().boardStr!;
			this.cache.set(_boardStr, hint);
		},
		addNoHintAvailableToCache(boardStr?: BoardString) {
			this.cache.set(boardStr ?? usePuzzleStore().boardStr!, null);
		}
	}

})