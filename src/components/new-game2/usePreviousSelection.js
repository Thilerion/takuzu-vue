import { useStorage } from "@vueuse/core";
import { toRefs } from "vue";

const STORAGE_KEY = 'takuzu_freeplay-selection';
const DEFAULT_SELECTION = {
	width: 6,
	height: 6,
	difficulty: 1
}

export const usePreviousSelection = () => {
	const state = useStorage(STORAGE_KEY, DEFAULT_SELECTION);

	return state;
}