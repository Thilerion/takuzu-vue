import { defineStore } from "pinia";
import { computed } from "vue";
import { usePuzzleVisualCuesStore } from "../puzzle-visual-cues.js";

// TODO: remove references to hintHighlightsStore; it is replaced by the puzzleVisualCuesStore
export const useHintHighlightsStore = defineStore('hintHighlights', () => {
	const visualCuesStore = usePuzzleVisualCuesStore();
	const visible = computed({
		get: () => visualCuesStore.highlightsVisible,
		set: (val: boolean) => visualCuesStore.highlightsVisible = val
	})
	const hasCurrentHighlights = computed(() => {
		return visualCuesStore.highlights.length > 0;
	})

	const show = () => {
		if (visible.value) return;
		else if (!hasCurrentHighlights.value) {
			console.warn(`Trying to show highlights, but none are set... Reverting highlight visibility to hidden.`);
			visible.value = false;
			return;
		} else {
			visible.value = true;
		}
	}

	const hide = () => {
		if (!visible.value) return;
		visible.value = false;
	}

	const clear = () => {
		visible.value = false;
		visualCuesStore.clearHighlights();
	}

	return {
		visible,

		show, hide,
		clear, reset: clear,
	}
});