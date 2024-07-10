import { PRESET_BOARD_SIZES, BoardPreset } from "@/config.js";
import type { DifficultyKey } from "@/lib/types.js";
import { type Ref, computed } from "vue";
import { getValidPresetsForDifficulty, sortPresetsByTypeAndSize } from "../helpers/board-presets.js";

type SelectedDifficultyRef = Ref<DifficultyKey | DifficultyKey[] | null | undefined>;

export const useValidPuzzlePresets = (
	selectedDifficulty: SelectedDifficultyRef
) => {
	const ALL_PRESETS = Object.freeze(PRESET_BOARD_SIZES);

	// Presets for different board shape types, with maxDifficulty filters
	const validPresetsForSelectedDifficulty = computed((): BoardPreset[] => {
		const selected = selectedDifficulty.value;
		if (selected == null) return [...ALL_PRESETS];
		return sortPresetsByTypeAndSize(getValidPresetsForDifficulty(selected));
	})

	return {
		ALL_PRESETS,
		validPresetsForSelectedDifficulty,
	};
}