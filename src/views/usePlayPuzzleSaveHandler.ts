import { useSavedPuzzle } from "@/services/savegame/useSavedGame.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { storeToRefs } from "pinia";
import { watch } from "vue";

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
	
	const { status, finished } = storeToRefs(puzzleStore);
	// Also auto-save on pause/visibility change (window no longer visible)/window unload or close
	// Instead of using window.onbeforeunload to save before the window unloads, using visibilitystate is better
	// But visibilitystate should trigger an automatic pause, so we can watch the paused state here to determine if auto-saving is required
	// see: https://www.igvita.com/2015/11/20/dont-lose-user-and-app-state-use-page-visibility/ and https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#usage_notes
	watch([status, finished], ([puzzleStatus, isFinished], [prevStatus]) => {
		if (autoSaveIntervalId == null) return; // auto-save is not enabled, so this should not trigger either
		if (puzzleStatus === 'paused' && prevStatus !== 'paused' && !isFinished) {
			console.log('Saving due to pause');
			saveGame();
		}
	})

	const initAutoSave = () => {
		if (autoSaveIntervalId != null) {
			// Trying to init auto-save when it's already running
			clearInterval(autoSaveIntervalId);
		}
		autoSaveIntervalId = setInterval(() => {
			// Save the puzzle
			// TODO: pause autoSave when the game is paused
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