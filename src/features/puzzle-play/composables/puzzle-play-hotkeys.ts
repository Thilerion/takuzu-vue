import { usePuzzleHintsStore } from "@/features/hints/store.js";
import { useSettingsStore } from "@/features/settings/store.js";
import { usePuzzleValidationStore } from "@/stores/assistance/validation.js";
import { usePuzzleHistoryStore } from "@/stores/puzzle-history/history-store.js";
import type { PuzzleStatus } from "@/stores/puzzle/status-store.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { usePuzzlePauseResume } from "@/stores/puzzle/usePuzzlePauseResume.js";
import { useMagicKeys, whenever } from "@vueuse/core"
import { logicAnd, logicNot } from "@vueuse/math";
import { computed, type ComputedRef } from "vue";

type HotkeyEventHandlerMap<T extends string> = Record<T, () => void>;
export type PuzzlePlayEventHandlers = HotkeyEventHandlerMap<'undo' | 'togglePause' | 'resumePlay' | 'getHint' | 'hideHint' | 'check'>;

export const usePuzzlePlayHotkeys = ({
	undo, togglePause, resumePlay, getHint, hideHint, check
}: PuzzlePlayEventHandlers): void => {
	const magicKeys = useMagicKeys();

	const noModifierKeysPressed = logicAnd(
		logicNot(magicKeys['ctrl']),
		logicNot(magicKeys['shift']),
		logicNot(magicKeys['alt']),
	);

	const keyWithoutModifiers = (key: string) => logicAnd(
		noModifierKeysPressed,
		magicKeys[key]
	);

	whenever(magicKeys['ctrl+z'], () => undo());

	whenever(magicKeys['Pause'], () => togglePause());
	whenever(keyWithoutModifiers('p'), () => togglePause());
	whenever(magicKeys['Play'], () => resumePlay());

	whenever(magicKeys['?'], () => getHint());
	whenever(keyWithoutModifiers('h'), () => getHint());
	whenever(keyWithoutModifiers('Escape'), () => hideHint());
	
	whenever(keyWithoutModifiers('c'), () => check());
}

export const usePuzzlePlayHotkeyCallbacks = (
	puzzlePlayStatus: ComputedRef<PuzzleStatus>,
	activeUi: ComputedRef<boolean>
): PuzzlePlayEventHandlers => {
	const { manualResumeGame, toggleManualPause } = usePuzzlePauseResume();

	const puzzleStatusIsPlaying = computed(() => puzzlePlayStatus.value === 'playing');
	// Whether the puzzle is active and being played: the puzzle ui is shown, and the puzzle is loaded and not paused/finished/etc
	const activePlay = computed(() => activeUi.value && puzzleStatusIsPlaying.value);

	return {
		undo: () => {
			if (!activePlay.value) return;
			if (usePuzzleHistoryStore().canUndo) usePuzzleStore().undoLastMove();
		},
		check: () => {
			if (!activePlay.value) return;
			if (!useSettingsStore().checkButtonEnabled) return;
			usePuzzleValidationStore().userCheck();
		},
		togglePause: () => {
			// Check if puzzle ui is active, because otherwise the puzzle can be manually paused while the dropdown menu or settings are open
			// However, "activePlay" also checks if not paused, so that can't be used here
			if (!activeUi.value) return;
			toggleManualPause();
		},
		resumePlay: () => {
			if (!activeUi.value) return;
			manualResumeGame();
		},
		getHint: () => {
			if (!activePlay.value) return;
			const hintsStore = usePuzzleHintsStore();
			if (hintsStore.isHintShown) return;
			hintsStore.getHint();
		},
		hideHint: () => {
			if (!activePlay.value) return;
			const hintsStore = usePuzzleHintsStore();
			if (!hintsStore.isHintShown) return;
			hintsStore.hide();
		}
	}
}