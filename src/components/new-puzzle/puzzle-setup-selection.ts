import { isDifficultyKey } from "@/config.js";
import type { BasicPuzzleConfig, BoardShape, DifficultyKey } from "@/lib/types.js";
import { useStorage } from "@vueuse/core";
import { computed, readonly, ref } from "vue";

export type PreviousSelectionState = {
	size: BoardShape,
	difficulty: DifficultyKey,
	debug_autoReplayMode: boolean,
}

const STORAGE_KEY = 'takuzu_freeplay-selection';
const getDefaultSelection = (): PreviousSelectionState => ({
	size: {
		width: 6,
		height: 6
	},
	difficulty: 1,
	debug_autoReplayMode: false,
})

export const usePuzzleSetupSelection = () => {
	const persistedSelection = useStorage<PreviousSelectionState>(
		STORAGE_KEY, 
		getDefaultSelection(),
		localStorage,
		{
			writeDefaults: true,
			mergeDefaults: (stored, defaults) => {
				// Replace entire object witht the defaults if it's missing any keys
				if (stored == null || stored.difficulty == null || stored.size == null) {
					return defaults;
				}
				return stored;
			},
			deep: true,
		}
	);

	// Selected puzzle difficulty and dimensions, which initially match the persisted selection
	const selectedDimensions = ref<BoardShape>({...persistedSelection.value.size});
	const selectedDifficulty = ref<DifficultyKey>(persistedSelection.value.difficulty);

	const selectedPuzzleConfig = computed((): BasicPuzzleConfig => {
		return {
			difficulty: selectedDifficulty.value,
			...selectedDimensions.value,
		}
	})

	// Selection functions for difficulty, and for dimensions, which validate that property by itself (and not as combination)
	const selectDifficulty = (difficulty: DifficultyKey | number) => {
		if (isDifficultyKey(difficulty)) {
			selectedDifficulty.value = difficulty;
		} else throw new Error(`Cannot select difficulty "${difficulty}"; this is not a valid DifficultyKey.`);
	}
	const selectDimensions = ({ width, height }: BoardShape) => {
		selectedDimensions.value = { width, height };
	}

	return {
		persistedSelection: readonly(persistedSelection),
		updatePersistedSelection: (updates: Partial<PreviousSelectionState>) => {
			const merged = {
				...persistedSelection.value,
				...updates,
			}
			if (updates.size != null) {
				merged.size = {
					...persistedSelection.value.size,
					...updates.size,
				}
			}
			persistedSelection.value = merged;
		},

		selectedDimensions,
		selectDimensions,
		selectedDifficulty,
		selectDifficulty,

		selectedPuzzleConfig,
	};
}