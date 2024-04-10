import type { BoardString } from "@/lib/types.js";
import { defineStore } from "pinia";
import type { Hint } from "../hints/Hint.js";
import { validateHint } from "../hints/helpers.js";
import { searchForHint } from "../hints/search.js";
import { usePuzzleStore } from "../puzzle/store.js";
import { useHintHighlightsStore } from "./highlights-store.js";
import { computed, reactive, readonly, ref } from "vue";
import type { SteppedHint } from "./stepped-hint/types.js";

export const usePuzzleHintsStore = defineStore('puzzleHints', () => {
	// state
	const isHintShown = ref(false);
	const current = reactive({
		hint: null,
		boardStr: null
	} as { hint: Hint | SteppedHint | null, boardStr: BoardString | null });
	const cache = ref(new Map<BoardString, (null | Hint | SteppedHint)>());
	const currentHint = computed(() => current.hint as null | Hint | SteppedHint);

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
		/* if (currentHint.value == null) {
			throw new Error('Cannot show hint as there is no current hint set. Will hide hint and highlights instead.');
		} */
		if (currentHint.value != null && currentHint.value.isLegacyHint) {
			const hintHighlightsStore = useHintHighlightsStore();
			hintHighlightsStore.show();
		} else if (currentHint.value != null) {
			// handled from component for stepped hints
			// console.log('Cannot show stepped hint highlight from store.');
		}
		isHintShown.value = true;
	}
	const showCurrentHintIfAvailable = () => {
		/* if (currentHint.value == null) {
			hideCurrentHint();
			return;
		} */
		showCurrentHint();
	}
	const hideCurrentHint = () => {
		if (currentHint.value != null && currentHint.value.isLegacyHint) {
			const hintHighlightsStore = useHintHighlightsStore();
			hintHighlightsStore.hide();
		} else if (currentHint.value != null && currentHint.value.isSteppedHint) {
			// handled from component for stepped hints
			// console.log('Cannot hide stepped hint highlight from store.');
		}
		isHintShown.value = false;
	}
	const removeCurrentHint = () => {
		current.hint = null;
		current.boardStr = null;
		isHintShown.value = false;
		const hintHighlightsStore = useHintHighlightsStore();
		hintHighlightsStore.clear();
	}

	const setNewHint = (hint: Hint | SteppedHint) => {
		current.hint = hint;
		current.boardStr = currentBoardStr.value;
		_addToCache(hint, currentBoardStr.value);
		if (hint.isLegacyHint) {
			const hintHighlightsStore = useHintHighlightsStore();
			hintHighlightsStore.setFromHint(hint);
		} else {
			// do not set highlights for stepped hint from here, it is handled by onShow/onHide etc callbacks in hint from the component
			// console.warn('Setting highlights for stepped hint is not yet implemented?');
		}
	}
	const setCachedHint = (hint: Hint | SteppedHint | null) => {
		current.hint = hint;
		current.boardStr = currentBoardStr.value;
		const hintHighlightsStore = useHintHighlightsStore();
		if (hint == null) {
			hintHighlightsStore.clear();
		} else if (hint.isLegacyHint) {
			hintHighlightsStore.setFromHint(hint);
		} else if (hint.isSteppedHint) {
			// handle from component for stepped hints
			// console.warn('Setting highlights for stepped hint is not yet implemented?');
		}
		if (!cache.value.has(currentBoardStr.value)) {
			throw new Error('Setting cached hint, but it is not in cache. This should not happen.');
		}
	}
	const setNoHintAvailable = () => {
		current.hint = null;
		current.boardStr = currentBoardStr.value;
		_addToCache(null, currentBoardStr.value);
		const hintHighlightsStore = useHintHighlightsStore();
		hintHighlightsStore.clear();
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
			const cachedHint = (cache.value.get(currentBoardStr.value) ?? null) as null | Hint | SteppedHint;
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
		const hintHighlightsStore = useHintHighlightsStore();
		hintHighlightsStore.reset();	
	}

	const _addToCache = (hint: Hint | SteppedHint | null, boardStr: BoardString) => {
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