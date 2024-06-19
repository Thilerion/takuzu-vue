import { useMainStore } from "@/stores/main.js";
import { toReactive, toRefs, useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export type PuzzleEditorSettings = {
	inputMode: 'toggle' | 'keyboard';
	showSolution: boolean;
}

export const usePuzzleEditorSettings = defineStore('puzzleEditorSettings', () => {
	const getDefaultSettings = (): PuzzleEditorSettings => {
		const hasTouchscreen = useMainStore().context.hasTouchscreen;
		return {
			inputMode: hasTouchscreen ? 'toggle' : 'keyboard',
			showSolution: true,
		}
	}

	const stateRef = useLocalStorage(
		"takuzu_puzzleEditorSettings",
		getDefaultSettings(),
		{ deep: true, writeDefaults: true }
	);

	const reset = () => stateRef.value = getDefaultSettings();

	const state = toReactive(stateRef);
	return {
		...toRefs(state),
		reset,
	};
});