import { createSharedComposable } from "@vueuse/core";
import { computed, watchEffect } from "vue";
import { usePuzzleHintsStore } from "../puzzle-hinter.js";
import { usePuzzleTimer } from "../puzzle-timer.js";
import { usePuzzleStore } from "../puzzle.js";
import { toRef } from "vue";

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
		if (!store.pausedManually) return;
	
		store.pausedManually = false;
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
	const hintStore = usePuzzleHintsStore();
	watchEffect(() => {
		if (anyPaused.value && timerStore.running) {
			timerStore.pause();
		} else if (!anyPaused.value && !timerStore.running) {
			timerStore.resume();
		}

		if (anyPaused.value) {
			console.log('any paused');
			hintStore.hide();
		} else {
			console.log('all resumed');
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