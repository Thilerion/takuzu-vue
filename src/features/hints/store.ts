import type { BoardString } from "@/lib/types.js";
import { defineStore } from "pinia";
import { usePuzzleStore } from "../../stores/puzzle/store.js";
import { computed, reactive, readonly, ref } from "vue";
import { usePuzzleVisualCuesStore } from "../../stores/puzzle-visual-cues.js";

import type { SteppedHint, SteppedHintRawData } from "@/features/hints/services/SteppedHint/types.js";
import { searchForHint } from "@/features/hints/services/search.js";
import { exportSteppedHint, importSteppedHint } from "@/features/hints/services/SteppedHint/import-export.js";

export type HintSaveData = {
	cache: [BoardString, SteppedHintRawData][]
}

export const usePuzzleHintsStore = defineStore('puzzleHints', () => {
	// state
	const isHintShown = ref(false);
	const current = reactive({
		hint: null,
		boardStr: null
	} as { hint: SteppedHint | null, boardStr: BoardString | null });
	const cache = ref(new Map<BoardString, SteppedHint>());
	const currentHint = computed(() => current.hint as null | SteppedHint);

	// TODO: assistanceData used for stats/saved game; amount of hints requested, types, actions executed, etc

	const importHintSaveData = (data: HintSaveData) => {
		// first, reset all
		reset();
		// import hint cache
		cache.value = new Map();
		for (const [boardStr, hintData] of data.cache) {
			const hint = importSteppedHint(hintData);
			cache.value.set(boardStr, hint);
		}
	}

	const currentBoardStr = computed((): BoardString => usePuzzleStore().boardStr!);

	const showCurrentHint = () => {
		isHintShown.value = true;
	}
	const showCurrentHintIfAvailable = () => {
		showCurrentHint();
	}
	const hideCurrentHint = () => {
		isHintShown.value = false;
	}
	const removeCurrentHint = () => {
		current.hint = null;
		current.boardStr = null;
		isHintShown.value = false;
		const visualCuesStore = usePuzzleVisualCuesStore();
		visualCuesStore.clearHighlightsFromHints();
	}

	const setNewHint = (hint: SteppedHint) => {
		current.hint = hint;
		current.boardStr = currentBoardStr.value;
		_addToCache(hint, currentBoardStr.value);
	}

	const setCachedHint = (hint: SteppedHint | null) => {
		current.hint = hint;
		current.boardStr = currentBoardStr.value;
		if (!cache.value.has(currentBoardStr.value)) {
			throw new Error('Setting cached hint, but it is not in cache. This should not happen.');
		}
	}

	/** Check if a hint currently set, but not (completely) executed, is still valid for a possibly changed board. */
	const validateAndShowCurrentHint = (): boolean => {
		// if valid, but not in cache, display hint and ALSO add to cache with current boardStr
		if (currentHint.value == null) return false;
		if (current.boardStr === currentBoardStr.value) {
			// It is still valid, as the board has not changed
			showCurrentHint();
			return true;
		}

		const puzzleStore = usePuzzleStore();
		const isValid = currentHint.value.validate({
			board: puzzleStore.board!,
			solution: puzzleStore.solution!
		});

		if (isValid) {
			setNewHint(currentHint.value); // also adds to cache
			showCurrentHint();
			return true;
		} else {
			// hint is no longer valid, so unset it and return false
			removeCurrentHint();
			return false;
		}		
	}

	const getHint = () => {
		// Set cachedHint (or no hint) if current boardStr is set in cache, then show it
		if (cache.value.has(currentBoardStr.value)) {
			const cachedHint = (cache.value.get(currentBoardStr.value) ?? null) as null | SteppedHint;
			setCachedHint(cachedHint);
			showCurrentHintIfAvailable(); // as there is a possibility that the cached value is null
			return;
		}
		// Else, check currentHint validity, and show if it is valid. If now valid, remove it and continue.
		if (validateAndShowCurrentHint()) {
			return;
		}
		// Else, search for new hint
		const hint: SteppedHint = searchForHint(usePuzzleStore().board!, usePuzzleStore().solution!);
		if (hint != null) {
			setNewHint(hint);
			showCurrentHint();
			return;
		} else {
			throw new Error("There should never be no hint found, because the NoHintsFoundHint should be returned instead. So this should not happen.");
		}
	}

	function reset() {
		isHintShown.value = false;
		current.hint = null;
		current.boardStr = null;
		cache.value = new Map();
		const visualCuesStore = usePuzzleVisualCuesStore();
		visualCuesStore.clearHighlightsFromHints();
	}

	const _addToCache = (hint: SteppedHint, boardStr: BoardString) => {
		cache.value.set(boardStr, hint);
	}
	
	return {
		currentHint,
		isHintShown,

		getHint,
		reset,
		hide: hideCurrentHint,
		removeHint: removeCurrentHint,

		importHintSaveData,

		_cache: readonly(cache),
	}
})

// Extracted from store itself to prevent it from continuously showing up in Pinia devtools
export const exportHintSaveData = (): HintSaveData => {
	const cache = usePuzzleHintsStore()._cache;
	if (cache.size === 0) return { cache: []};
	const result: [BoardString, SteppedHintRawData][] = [];
	for (const [boardStr, hint] of cache) {
		const data = exportSteppedHint(hint as SteppedHint);
		result.push([boardStr, data]);
	}
	return { cache: result };
}