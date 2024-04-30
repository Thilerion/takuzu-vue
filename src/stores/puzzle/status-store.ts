import { usePuzzleEventEmitter } from "@/composables/puzzle-events.js";
import { defineStore } from "pinia";
import { ref, computed, readonly, watch } from "vue";

export type PuzzleStatus = 'none' | 'loading' | 'error_loading' | 'pending' | 'playing' | 'paused' | 'finished';
type PuzzleInitializationError = {
	hasError: false,
	errorMessage?: undefined
} | {
	hasError: true,
	errorMessage?: string
}

export const usePuzzleStatusStore = defineStore('puzzle-status', () => {
	// "Paused" state, can be both manually and automatically triggered
	// Functionality for pausing/resuming, and pausing/resuming timer, etc is handled in "usePuzzlePauseResume"
	const pausedManually = ref(false);
	const pausedAutomatically = ref(false);
	const paused = computed(() => pausedManually.value || pausedAutomatically.value);

	// Game creation/loading/error state
	const loading = ref(false);
	const initializationError = ref<PuzzleInitializationError>({ hasError: false });
	const hasInitializationError = computed(() => initializationError.value.hasError);

	// Initialized/started/finished state
	const initialized = ref(false);
	const started = ref(false);
	const finished = ref(false);

	// Resulting computed status
	const status = computed((): PuzzleStatus => {
		if (loading.value) return 'loading';
		else if (hasInitializationError.value) return 'error_loading';
		else if (finished.value) return 'finished';
		else if (paused.value) return 'paused';
		else if (started.value) return 'playing';
		else if (initialized.value) {
			// After "initialized", but before the PlayPuzzle component is mounted and has called "start"
			return 'pending';
		}
		
		// Default state is none; which is most likely to happen when state is not initialized
		if (!initialized.value) return 'none';
		else {
			// This probably should not happen: initialized, but not started, finished, or paused.
			console.warn('Unexpected puzzle play status: initialized, but not started, finished, or paused.');
			return 'none';
		}
	})

	// TODO: Use initializationError in places other than "initPuzzle" and "replayRandomPuzzle
	function setInitializationError(val: boolean, msg?: string): void {
		if (!val) {
			initializationError.value = { hasError: false };
			return;
		}
		initializationError.value = { hasError: true, errorMessage: msg };
	}

	// TODO: setter functions for status changes, which validate and then update all other status values
	// for instance; setting "paused" checks that "initialized" is definitely true

	function resetStatus(): void {
		pausedManually.value = false;
		pausedAutomatically.value = false;
		loading.value = false;
		initializationError.value = { hasError: false };
		initialized.value = false;
		started.value = false;
		finished.value = false;
	}

	// Emit resume and pause events when status changes
	const puzzleEmitter = usePuzzleEventEmitter();
	watch(status, (cur, prev) => {
		if (cur === 'playing' && prev === 'paused') {
			puzzleEmitter.emit('resume');
		} else if (cur === 'paused' && prev === 'playing') {
			puzzleEmitter.emit('pause');
		}
	})

	return {
		// Paused state
		pausedManually,
		pausedAutomatically,
		paused,

		// Loading state
		loading,
		initializationError: readonly(initializationError),
		hasInitializationError,
		setInitializationError,

		// Initialized/started/finished state
		initialized,
		started,
		finished,

		// Computed status
		status,
		resetStatus,
	}
})