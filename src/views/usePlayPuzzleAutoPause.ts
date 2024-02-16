import { usePuzzlePauseResume } from "@/stores/puzzle/usePuzzlePauseResume.js"
import type { Ref } from "vue"
import { computed, watchEffect } from "vue"

export type UsePlayPuzzleAutoPauseDeps = {
	settingsOpen: Ref<boolean>,
	dropdownOpen: Ref<boolean>,
	windowHidden: Ref<boolean>,
	userIdle: Ref<boolean>,
}
export type UsePlayPuzzleAutoPauseOpts = {
	autoResumeDelay: number
}

/**
 * Handles automatic pausing and resuming of the puzzle game based on various conditions.
 *
 * @param deps - Required dependencies: userIdle, and state of settings/dropdown overlays and window visibility.
 * @param opts - The options for auto pausing and resuming: the delay before auto-resuming occurs.
 */
export const usePlayPuzzleAutoPause = (
	deps: UsePlayPuzzleAutoPauseDeps,
	opts: UsePlayPuzzleAutoPauseOpts
) => {
	const { 
		settingsOpen, dropdownOpen, windowHidden,
		userIdle
	} = deps;
	const { autoResumeDelay } = opts;

	const { autoResumeGame, autoPauseGame } = usePuzzlePauseResume();

	let autoResumeDelayId: ReturnType<typeof setTimeout> | null = null;

	const shouldAutoPause = computed(() => {
		return settingsOpen.value || dropdownOpen.value || windowHidden.value;
	})

	watchEffect(() => {
		if (shouldAutoPause.value) {
			// Pause the game
			autoPauseGame();
			return;
		} else {
			// Auto-resume the game, after a small delay
			// This prevents a "resume" from occuring when dropdownOpen turns into false, and later settingsOpen turns into true.
			if (autoResumeDelayId != null) {
				clearTimeout(autoResumeDelayId);
				autoResumeDelayId = null;
			}
			autoResumeDelayId = setTimeout(() => {
				// Resume the game
				autoResumeGame();
			}, autoResumeDelay);
			return;
		}
	})
	watchEffect(() => {
		if (userIdle.value) {
			autoPauseGame();
		}
	})
}