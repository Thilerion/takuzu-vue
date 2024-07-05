import { PRESET_BOARD_SIZES, BoardPreset, type BoardType } from "@/config.js";
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

	const validPresetsForSelectedDifficultyByType = computed((): Record<BoardType, BoardPreset[]> => {
		const result: Record<BoardType, BoardPreset[]> = {
			Normal: [],
			Rectangular: [],
			Odd: [],
		};

		for (const preset of validPresetsForSelectedDifficulty.value) {
			const { type } = preset;
			if (!result[type]) throw new Error(`Unexpected board type "${type}" in validPresetsForSelectedDifficultyByType`);
			result[type].push(preset);
		}

		return result;
	})

	return {
		ALL_PRESETS,
		validPresetsForSelectedDifficulty,
		validPresetsForSelectedDifficultyByType,
	};
}