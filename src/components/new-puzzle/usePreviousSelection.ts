import type { BoardShape, DifficultyKey } from "@/lib/types";
import { useStorage } from "@vueuse/core";

type PreviousSelectionState = {
	size: BoardShape,
	difficulty: DifficultyKey
}

const STORAGE_KEY = 'takuzu_freeplay-selection';
const getDefaultSelection = (): PreviousSelectionState => ({
	size: {
		width: 6,
		height: 6
	},
	difficulty: 1
})

export const usePreviousSelection = () => {
	const state = useStorage(STORAGE_KEY, getDefaultSelection(), localStorage, {
		writeDefaults: true,
		mergeDefaults: (storedValue, defaults) => {
			if (storedValue == null || storedValue.difficulty == null || storedValue.size == null) {
				return defaults;
			}
			if (storedValue.size.width == null || storedValue.size.height == null) return defaults;
			return storedValue;
		}
	});

	return state;
}