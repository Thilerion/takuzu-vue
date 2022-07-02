import { useStorage } from "@vueuse/core";

const STORAGE_KEY = 'takuzu_freeplay-selection';
const DEFAULT_SELECTION = {
	size: {
		width: 6,
		height: 6
	},
	difficulty: 1
}

export const usePreviousSelection = () => {
	const state = useStorage(STORAGE_KEY, DEFAULT_SELECTION);

	if (state.value.size == null && state.value.width != null) {
		const { width, height, difficulty } = state.value;
		state.value = {
			size: {
				width, height
			}, difficulty
		};
	}

	return state;
}