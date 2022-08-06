import { defineStore, storeToRefs } from "pinia";
import { usePuzzleValidationStore } from "./validation";

export const usePuzzleAssistanceStore = defineStore('puzzleAssistance', () => {
	// expose only some properties from puzzleValidationStore (and other puzzleAssistance helper stores in the future)
	const puzzleValidationStore = usePuzzleValidationStore();
	const { userCheck, autoFilledBoardCheck, resetMarkedMistakes, removeFromMarkedMistakes, reset: resetValidationStore } = puzzleValidationStore;
	const {
		userChecks,
		mistakesFound,
		markedMistakes,
		checkAssistanceData
	} = storeToRefs(puzzleValidationStore);

	const reset = () => {
		resetValidationStore();
	}

	return {
		userChecks, mistakesFound, markedMistakes,
		checkAssistanceData,
		userCheck, autoFilledBoardCheck, resetMarkedMistakes,
		removeFromMarkedMistakes, resetValidationStore,

		reset
	}
})