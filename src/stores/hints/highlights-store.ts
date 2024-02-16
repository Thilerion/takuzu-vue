import { defineStore } from "pinia";
import { ref } from "vue";
import type { Hint } from "../hints/Hint.js";
import { usePuzzleStore } from "../puzzle/store.js";
import { createHighlightsFromLegacyHint } from "./highlights/legacy-hint-highlights.js";
import type { HintHighlight } from "./highlights/types.js";

export const useHintHighlightsStore = defineStore('hintHighlights', () => {
	const visible = ref(false);
	const currentHighlights = ref<HintHighlight[]>([]);

	const show = () => {
		if (visible.value) return;
		else if (!currentHighlights.value?.length) {
			console.warn(`Trying to show highlights, but none are set... Reverting highlight visibility to hidden.`);
			visible.value = false;
			return;
		} else {
			visible.value = true;
		}
	}
	const displayFromHint = (hint: Hint) => {
		if (hint.isLegacyHint) {
			const puzzleStore = usePuzzleStore();
			const highlights: HintHighlight[] = createHighlightsFromLegacyHint(hint, puzzleStore.board!) ?? [];
			setHighlights(highlights, { setVisible: true });
			return;
		} else {
			console.warn('This is a new type of hint that should be able to display its own highlights. Therefore, calling displayFromHint is not necessary.');
		}
	}

	const hide = () => {
		if (!visible.value) return;
		visible.value = false;
	}
	const setHighlights = (highlights: HintHighlight[], { setVisible = false } = {}) => {
		if (!Array.isArray(highlights)) {
			console.warn('Setting highlights requires an array.');
			return;
		}

		if (highlights.length) {
			currentHighlights.value = [...highlights];
			if (setVisible) {
				visible.value = true;
			}
		} else {
			currentHighlights.value = [];
			if (visible.value) {
				console.warn('Current highlights are unset, so will now automatically hide the highlights.');
				visible.value = false;
			}
		}
	}
	const clear = () => {
		visible.value = false;
		currentHighlights.value = [];
	}

	return {
		visible, currentHighlights,

		show, hide,
		clear, reset: clear,
		displayFromHint,
		setHighlights
	}
});