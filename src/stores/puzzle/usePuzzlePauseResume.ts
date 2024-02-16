import { createSharedComposable } from "@vueuse/core";
import { watchEffect, toRef } from "vue";
import { usePuzzleStore } from "./store.js";
import { usePuzzleTimer } from "./timer-store.js";

export const usePuzzlePauseResume = createSharedComposable(() => {
	const store = usePuzzleStore();

	const autoPauseGame = () => {
		if (store.pausedAutomatically) return;
	
		store.pausedAutomatically = true;
	}
	const autoResumeGame = () => {
		if (!store.pausedAutomatically) return;
	
		store.pausedAutomatically = false;
	}
	const manualPauseGame = () => {
		if (store.pausedManually) return;
	
		store.pausedManually = true;
	}
	const manualResumeGame = () => {
		// manual resume should also clear automatic pause if it is still active (for instance due to idle time)
		store.pausedManually = false;
		store.pausedAutomatically = false;
	}
	const toggleManualPause = () => {
		if (store.pausedManually) {
			manualResumeGame();
		} else {
			manualPauseGame();
		}
	}
	const toggleAutoPause = () => {
		if (store.pausedAutomatically) {
			autoResumeGame();
		} else {
			autoPauseGame();
		}
	}

	const anyPaused = toRef(store, 'paused');

	const timerStore = usePuzzleTimer();
	watchEffect(() => {
		if (anyPaused.value && timerStore.running) {
			timerStore.pause();
		} else if (!anyPaused.value && !timerStore.running) {
			timerStore.resume();
		}
	})

	return {
		autoPauseGame,
		autoResumeGame,
		toggleAutoPause,

		manualPauseGame,
		manualResumeGame,
		toggleManualPause,
	};
});