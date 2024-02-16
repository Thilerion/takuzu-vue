import { useSavedPuzzle } from "@/services/savegame/useSavedGame.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";

export type UsePlayPuzzleSaveHandlerOpts = {
	interval: number
}

export const usePlayPuzzleSaveHandler = (
	opts: UsePlayPuzzleSaveHandlerOpts = { interval: 1500 }
) => {
	const { interval: intervalDuration } = opts;
	let autoSaveIntervalId: ReturnType<typeof setInterval> | null = null;

	const { hasCurrentSavedGame, savePuzzleSaveData } = useSavedPuzzle();

	const puzzleStore = usePuzzleStore();
	const canSaveGame = () => {
		return puzzleStore.initialized && puzzleStore.started && !puzzleStore.finished && puzzleStore.board?.grid != null;
	}

	const saveGame = () => {
		if (canSaveGame()) {
			savePuzzleSaveData();
		}
	}

	const initAutoSave = () => {
		if (autoSaveIntervalId != null) {
			// Trying to init auto-save when it's already running
			clearInterval(autoSaveIntervalId);
		}
		autoSaveIntervalId = setInterval(() => {
			// Save the puzzle
			saveGame();
		}, intervalDuration);
	}
	const stopAutoSave = () => {
		clearInterval(autoSaveIntervalId!);
		autoSaveIntervalId = null;
	}

	return {
		hasCurrentSavedGame,
		saveGame,

		initAutoSave,
		stopAutoSave,
	}
}