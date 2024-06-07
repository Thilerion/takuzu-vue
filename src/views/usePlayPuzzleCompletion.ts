import { usePuzzleValidationStore } from "@/stores/assistance/validation.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { ref, watch } from "vue";

export function useGameCompletion() {
	const puzzleStore = usePuzzleStore();

	// TODO: these probably do not need to be refs
	const finishedTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
	const mistakeCheckTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

	// Logic to handle when the game is finished and correctly solved
	const handleGameFinishedAndSolved = () => {
		finishedTimeout.value = globalThis.setTimeout(() => {
			puzzleStore.finishPuzzle();
			finishedTimeout.value = null;
		}, 600);
	};

	// Logic to handle when the game is finished with mistakes
	const handleGameFinishedWithMistakes = () => {
		mistakeCheckTimeout.value = globalThis.setTimeout(() => {
			mistakeCheckTimeout.value = null;
			if (!puzzleStore.finishedWithMistakes) {
				return;
			}
			// autoCheckErrors
			// TODO: was previously puzzleAssistanceStore.autoFilledBoardCheck();
			usePuzzleValidationStore().filledBoardValidationCheck();
		}, 2000);
	};

	// Watches for changes in the puzzle's completion state to trigger the respective handlers
	const unwatchFinishedAndSolved = watch(() => puzzleStore.finishedAndSolved, (newValue, prevValue) => {
		if (newValue) {
			handleGameFinishedAndSolved();
		} else if (prevValue && !newValue) {
			// Puzzle is no longer finished and solved, which can happen after the player undoes a move,
			// Or incorrectly adjusts a cell to the wrong value.
			clearTimeout(finishedTimeout.value!);
			finishedTimeout.value = null;
		}
	})
	
	const unwatchFinishedWithMistakes = watch(() => puzzleStore.finishedWithMistakes, (newValue) => {
		if (newValue) {
			handleGameFinishedWithMistakes();
		} else {
			// Puzzle is no longer finished with mistakes,
			// which can happen after the player fixes their mistake in time, or undoes a move.
			clearTimeout(mistakeCheckTimeout.value!);
			mistakeCheckTimeout.value = null;
		}
	})

	// Cleanup function to clear timeouts
	const clearCompletionCheckTimeouts = () => {
		clearTimeout(finishedTimeout.value!);
		clearTimeout(mistakeCheckTimeout.value!);
	};

	const cleanup = () => {
		clearCompletionCheckTimeouts();
		unwatchFinishedAndSolved();
		unwatchFinishedWithMistakes();
	}

	return { clearCompletionCheckTimeouts, cleanup };
}