import { useMainStore } from "@/stores/main.js";
import { createSharedComposable, toReactive, toRefs, useLocalStorage } from "@vueuse/core";

export type PuzzleEditorSettings = {
	inputMode: 'toggle' | 'keyboard';
	showSolution: boolean;
}

const getDefaultSettings = (): PuzzleEditorSettings => {
	const hasTouchscreen = useMainStore().context.hasTouchscreen;
	return {
		inputMode: hasTouchscreen ? 'toggle' : 'keyboard',
		showSolution: true,
	}
}

export const usePuzzleEditorSettings = createSharedComposable(() => {
	const stateRef = useLocalStorage(
		"takuzu_puzzleEditorSettings",
		getDefaultSettings(),
		{ deep: true, writeDefaults: true }
	);

	const state = toReactive(stateRef);
	return { ...toRefs(state) };
})