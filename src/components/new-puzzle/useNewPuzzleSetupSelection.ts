import type { BoardShape, DifficultyKey } from "@/lib/types";
import { useStorage } from "@vueuse/core";

type PreviousSelectionState = {
	size: BoardShape,
	difficulty: DifficultyKey,
	debug_autoReplayMode?: boolean
}

const STORAGE_KEY = 'takuzu_freeplay-selection';
const getDefaultSelection = (): PreviousSelectionState => ({
	size: {
		width: 6,
		height: 6
	},
	difficulty: 1
})

const mergeSelectionDefaults = (stored: PreviousSelectionState, defaults: PreviousSelectionState) => {
	if (stored == null || stored.difficulty == null || stored.size == null) {
		return defaults;
	}
	if (stored.size.width == null || stored.size.height == null) {
		return defaults;
	}
	return stored;
}

export const useNewPuzzleSetupSelection = () => {
	const state = useStorage(STORAGE_KEY, getDefaultSelection(), localStorage, {
		writeDefaults: true,
		mergeDefaults: mergeSelectionDefaults,
	});
	return state;
}