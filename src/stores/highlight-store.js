import { defineStore } from "pinia";
import { ref } from "vue";

export const useHintHighlightsStore = defineStore('hintHighlights', () => {
	const visible = ref(false);
	const currentHighlights = ref([]);

	const show = () => {
		if (visible.value) return;
		else if (currentHighlights.value?.length) {
			console.warn(`Trying to show highlights, but none are set... Reverting highlight visibility to hidden.`);
			visible.value = false;
			return;
		} else {
			visible.value = true;
		}
	}
	const displayFromHint = (hint) => {
		console.warn('TODO: transform hint into hint highlight');
	}
	const hide = () => {
		if (!visible.value) return;
		visible.value = false;
	}
	const setHighlights = (highlights, { setVisible = false } = {}) => {
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