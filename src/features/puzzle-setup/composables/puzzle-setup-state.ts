import { BoardPreset, isDifficultyKey } from "@/config.js";
import type { BoardShape, DifficultyKey } from "@/lib/types.js"
import { computed, readonly, ref } from "vue";
import { getValidPresetsForDifficulty } from "../helpers/board-presets.js";
import { createSharedComposable } from "@vueuse/core";
import { type DifficultyRange, isDifficultyRange } from "../helpers/puzzle-setup-config.js";

export type PuzzleSetupPersistedState = {
	difficulty: DifficultyKey | DifficultyRange,
	size: BoardShape | BoardShape[],
	autoReplayMode: boolean,
}

const LS_KEY = 'takuzu_puzzleSetupState';

const getDefaultState = (): PuzzleSetupPersistedState => {
	return { difficulty: 1, size: { width: 6, height: 6 }, autoReplayMode: false };
}
const getInitialState = (): PuzzleSetupPersistedState => {
	const persistedState = localStorage.getItem(LS_KEY);
	if (persistedState == null) return getDefaultState();
	return JSON.parse(persistedState) as PuzzleSetupPersistedState;
}
const saveStateToStorage = (state: PuzzleSetupPersistedState) => {
	localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export const usePuzzleSetupState = createSharedComposable(() => {
	const initialState = getInitialState();
	const difficulty = ref<DifficultyKey | DifficultyRange>(initialState.difficulty);
	const size = ref<BoardShape | BoardShape[]>(initialState.size);
	const autoReplayMode = ref<boolean>(initialState.autoReplayMode);

	const isDifficultyRangeEnabled = computed(() => isDifficultyRange(difficulty.value));
	const isSizeMultipleSelectionEnabled = computed(() => Array.isArray(size.value));

	const toggleDifficultyRangeSelection = (val: boolean) => {
		if (val === isDifficultyRangeEnabled.value) return;
		if (val && !Array.isArray(difficulty.value)) {
			difficulty.value = [difficulty.value, difficulty.value];
		} else if (!val && Array.isArray(difficulty.value)) {
			// Use average of current min and max difficulty
			const avg = Math.floor((difficulty.value[0] + difficulty.value[1]) / 2);
			if (isDifficultyKey(avg)) {
				difficulty.value = avg;
			} else {
				difficulty.value = 1;
			}
		}
	}
	const toggleSizeMultipleSelection = (val: boolean) => {
		if (val === isSizeMultipleSelectionEnabled.value) return;
		const cur = size.value;
		if (val && !Array.isArray(cur)) {
			size.value = [{ ...cur }];
		} else if (!val && Array.isArray(cur)) {
			// Select first size in current list of selected sizes if there is one
			if (cur.length > 0) {
				size.value = cur[0];
				return;
			}
			// Else, select the default size (6x6), unless this size is invalid for the selected difficulty
			const validPresetsForDifficulty = getValidPresetsForDifficulty(difficulty.value);
			if (validPresetsForDifficulty.length === 0) {
				throw new Error('No valid presets found for difficulty.');
			} else if (validPresetsForDifficulty.some(p => p.width === 6 && p.height === 6)) {
				size.value = { width: 6, height: 6 };
				return;
			}
			// 6x6 is not valid for the selected difficulty, so select the smallest square size that is valid
			const smallestValidSquarePreset = validPresetsForDifficulty.reduce((acc, val) => {
				if (val.type !== 'Normal') return acc;
				const numCells = val.width * val.height;
				if (numCells >= acc.numCells) return acc;
				return {
					preset: val,
					numCells
				}
			}, { preset: null, numCells: Infinity } as { preset: BoardPreset | null, numCells: number });
			if (smallestValidSquarePreset.preset == null) {
				throw new Error('No valid presets found for difficulty, after finding the smallest valid square preset.');
			}
			size.value = smallestValidSquarePreset.preset;
		}
	}

	const toggleSize = (updatedSize: BoardShape) => {
		const { width, height } = updatedSize;
		const shape = { width, height };
		if (!isSizeMultipleSelectionEnabled.value) {
			size.value = shape;
			return;
		}
		if (!Array.isArray(size.value)) {
			throw new Error('Cannot toggle size when using a single size.');
		}
		const idx = size.value.findIndex(s => s.width === updatedSize.width && s.height === updatedSize.height);
		if (idx === -1) {
			size.value.push(shape);
		} else {
			size.value.splice(idx, 1);
		}
	}

	const setDifficultySingle = (val: DifficultyKey) => {
		if (isDifficultyRangeEnabled.value) {
			throw new Error('Cannot set difficulty when using a range.');
		}
		difficulty.value = val;
	}
	const setDifficultyRange = (range: { min?: DifficultyKey, max?: DifficultyKey }) => {
		if (!isDifficultyRangeEnabled.value || !Array.isArray(difficulty.value)) {
			throw new Error('Cannot set difficulty range when not using a range.');
		}
		const { min: updatedMin, max: updatedMax } = range;
		if (updatedMin == null && updatedMax == null) return;
		let min = updatedMin ?? difficulty.value[0];
		let max = updatedMax ?? difficulty.value[1];
		if (!isDifficultyKey(min) || !isDifficultyKey(max)) {
			throw new Error(`Invalid difficulty range; min and/or max are not valid DifficultyKeys: [${min}, ${max}]`);
		}
		// Update max to equal min if min is changed, and it is higher than max, and vice versa
		if (range.min != null && min > max) {
			max = min;
		} else if (range.max != null && max < min) {
			min = max;
		}
		const newRange: DifficultyRange = [min, max];
		if (newRange[0] === difficulty.value[0] && newRange[1] === difficulty.value[1]) {
			// no change in difficulty range
			return;
		}
		if (newRange[0] > newRange[1]) {
			console.error('Difficulty range min is higher than max. Reversing order, but this should not happen.');
			[newRange[0], newRange[1]] = [newRange[1], newRange[0]];
		}
		difficulty.value = newRange;
	}

	const persistableState = computed<PuzzleSetupPersistedState>((prev): PuzzleSetupPersistedState => {
		const state = {
			difficulty: difficulty.value,
			size: size.value,
			autoReplayMode: autoReplayMode.value,
		}
		if (prev != null && JSON.stringify(prev) === JSON.stringify(state)) return prev;
		return state;
	})
	const persistState = () => {
		const state = { ...persistableState.value };
		// If difficulty is a range, but min===max, set it to a single value
		if (isDifficultyRange(state.difficulty) && state.difficulty[0] === state.difficulty[1]) {
			console.log('Difficulty range is single value, converting to single value.');
			state.difficulty = state.difficulty[0];
		}
		// If size is an array, but there is only one item, set it to a single value
		if (Array.isArray(state.size) && state.size.length === 1) {
			console.log('Size is an array with a single item, converting to single value.');
			state.size = state.size[0];
		}
		saveStateToStorage(state);
	}

	return {
		// State
		difficulty: readonly(difficulty) as typeof difficulty,
		size: readonly(size),
		autoReplayMode,
		// Getters
		isDifficultyRangeEnabled, isSizeMultipleSelectionEnabled,
		// Setters for difficulty
		toggleDifficultyRangeSelection,
		setDifficultySingle, setDifficultyRange,
		// Setters for size
		toggleSizeMultipleSelection,
		toggleSize,

		// Persistence
		persistableState,
		persistState,
	}
});