import { defineStore, storeToRefs } from "pinia";
import { usePuzzleValidationStore } from "./validation";

export const usePuzzleAssistanceStore = defineStore('puzzleAssistance', () => {
	// expose only some properties from puzzleValidationStore (and other puzzleAssistance helper stores in the future)
	const puzzleValidationStore = usePuzzleValidationStore();
	const { userCheck, autoFilledBoardCheck, reset: resetValidationStore } = puzzleValidationStore;
	const {
		userChecks,
		mistakesFound,
		checkAssistanceData
	} = storeToRefs(puzzleValidationStore);

	const reset = () => {
		resetValidationStore();
	}

	return {
		userChecks, mistakesFound,
		checkAssistanceData,
		userCheck, autoFilledBoardCheck,
		resetValidationStore,

		reset
	}
})