import type { BoardString } from "@/lib/types.js";
import { defineStore } from "pinia";
import { searchForHint } from "../hints/search.js";
import { usePuzzleStore } from "../puzzle/store.js";
import { computed, reactive, readonly, ref } from "vue";
import type { SteppedHint } from "./stepped-hint/types.js";
import { usePuzzleVisualCuesStore } from "../puzzle-visual-cues.js";
import { validateHint } from "./helpers.js";

export const usePuzzleHintsStore = defineStore('puzzleHints', () => {
	// state
	const isHintShown = ref(false);
	const current = reactive({
		hint: null,
		boardStr: null
	} as { hint: SteppedHint | null, boardStr: BoardString | null });
	const cache = ref(new Map<BoardString, (null | SteppedHint)>());
	const currentHint = computed(() => current.hint as null | SteppedHint);

	// Discriminate between hint == null because none was found, or because it is simply the initial state
	const hintSearchedButNoneFound = computed(() => {
		return current.hint == null && current.boardStr != null;
	})

	// Note: does not include a requested hint that was not found, and does not include for how many different boards a hint was requested
	const uniqueHintsRequested = computed(() => {
		const uniqueHintIds = new Set<number>();
		for (const hint of cache.value.values()) {
			if (hint != null) uniqueHintIds.add(hint.id);
		}
		return uniqueHintIds.size;
	})
	// TODO: assistanceData used for stats/saved game; amount of hints requested, types, actions executed, etc

	const currentBoardStr = computed(() => usePuzzleStore().boardStr!);

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
		if (hint == null) {
			const visualCuesStore = usePuzzleVisualCuesStore();
			visualCuesStore.clearHighlightsFromHints();
		}
		if (!cache.value.has(currentBoardStr.value)) {
			throw new Error('Setting cached hint, but it is not in cache. This should not happen.');
		}
	}
	const setNoHintAvailable = () => {
		current.hint = null;
		current.boardStr = currentBoardStr.value;
		_addToCache(null, currentBoardStr.value);
		const visualCuesStore = usePuzzleVisualCuesStore();
		visualCuesStore.clearHighlightsFromHints();
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

		const h = currentHint.value;
		const isValid = validateHint(h);

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
		const hint = searchForHint(usePuzzleStore().board!, usePuzzleStore().solution!);
		if (hint != null) {
			setNewHint(hint);
			showCurrentHint();
			return;
		} else {
			setNoHintAvailable();
			showCurrentHint();
			return;
		}
	}

	const reset = () => {
		isHintShown.value = false;
		current.hint = null;
		current.boardStr = null;
		cache.value = new Map();
		const visualCuesStore = usePuzzleVisualCuesStore();
		visualCuesStore.clearHighlightsFromHints();
	}

	const _addToCache = (hint: SteppedHint | null, boardStr: BoardString) => {
		cache.value.set(boardStr, hint);
	}
	
	return {
		currentHint,
		isHintShown,
		hintSearchedButNoneFound,

		getHint,
		reset,
		hide: hideCurrentHint,
		removeHint: removeCurrentHint,

		_cache: readonly(cache),
		uniqueHintsRequested,
	}
})