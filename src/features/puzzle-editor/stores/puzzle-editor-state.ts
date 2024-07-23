import type { BoardShape, PuzzleGrid } from "@/lib/types.js";
import { clamp, useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, reactive, toRef, watch } from "vue";
import { CUSTOM_PUZZLE_MIN_SIZE, CUSTOM_PUZZLE_MAX_SIZE } from "../services/validate-dimensions.js";
import { EMPTY, type PuzzleValue } from "@/lib/constants.js";
import { rotate90, rotate270 } from "@/lib/transformations/base-transformations.js";
import { isPuzzleValueLineStr } from "@/lib/utils/puzzle-line.utils.js";
import { array2d } from "@/utils/array2d.utils.js";

type CustomPuzzleInputGridData = BoardShape & {
	forceSquareGrid: boolean;
	grid: PuzzleGrid | null;
}

const getDefaultData = (): CustomPuzzleInputGridData => ({
	width: 10,
	height: 10,
	forceSquareGrid: false,
	grid: null,
});

export const PUZZLE_EDITOR_STATE_STORAGE_KEY = 'takuzu_customPuzzleInputData';

export const usePuzzleEditorStore = defineStore('puzzleEditorState', () => {
	const storedState = useLocalStorage<CustomPuzzleInputGridData>(
		PUZZLE_EDITOR_STATE_STORAGE_KEY,
		getDefaultData(),
		{
			deep: true,
			writeDefaults: true,
			listenToStorageChanges: false
		}
	);

	const state = reactive<CustomPuzzleInputGridData>({
		...storedState.value,
	});

	watch(() => state, (value) => {
		storedState.value = value;
	}, { immediate: true, deep: true });

	const customPuzzleGrid = toRef<CustomPuzzleInputGridData, 'grid'>(state, "grid");

	const forceSquareGrid = computed({
		get: () => state.forceSquareGrid,
		set: (value) => {
			state.forceSquareGrid = value;
			if (value && state.height !== state.width) {
				state.height = state.width;
			}
		}
	});
	const width = computed({
		get: () => state.width,
		set: (value) => {
			state.width = clamp(CUSTOM_PUZZLE_MIN_SIZE, value, CUSTOM_PUZZLE_MAX_SIZE);
			if (state.forceSquareGrid) {
				state.height = value;
			}
		}
	});
	const height = computed({
		get: () => state.height,
		set: (value) => {
			state.height = clamp(CUSTOM_PUZZLE_MIN_SIZE, value, CUSTOM_PUZZLE_MAX_SIZE);
			if (state.forceSquareGrid) {
				state.width = value;
			}
		}
	});
	const dimensions = computed(() => ({ width: width.value, height: height.value }));

	// Create new (empty) grid with dimensions
	const resetGrid = (): void => {
		customPuzzleGrid.value = createEmptyGrid(dimensions.value);
	}

	// Expand or shrink grid with dimensions, while keeping existing values
	const updateDimensions = (): void => {
		if (customPuzzleGrid.value == null) {
			return resetGrid();
		}
		const { width, height } = dimensions.value;
		customPuzzleGrid.value = resizeGrid(customPuzzleGrid.value, width, height, EMPTY);
	}

	const emptyExistingGrid = computed(() => {
		return customPuzzleGrid.value != null && customPuzzleGrid.value.flat(3).every(v => v === EMPTY);
	})

	const config = computed(() => {
		return {
			width: width.value,
			height: height.value,
			forceSquareGrid: forceSquareGrid.value,
		}
	})

	const rotateGrid = (dir: 'cw' | 'ccw') => {
		if (customPuzzleGrid.value == null) return;
		const rotateResult = getRotatedGrid(dir, customPuzzleGrid.value);
		customPuzzleGrid.value = rotateResult.grid;
		width.value = rotateResult.width;
		height.value = rotateResult.height;
	}

	const isValidGrid = computed(() => {
		const grid = customPuzzleGrid.value;
		if (grid == null || !Array.isArray(grid) || !Array.isArray(grid[0])) return false;

		const { width, height } = dimensions.value;
		if (grid.length !== height || grid[0].length !== width) return false;
		
		if (!isPuzzleValueLineStr(grid.flat(3).join(''))) return false;
		return true;
	})

	return {
		dimensions,
		config,
		forceSquareGrid,
		width,
		height,
		customPuzzleGrid,

		emptyExistingGrid,
		isValidGrid,

		updateDimensions,
		resetGrid,
		rotateGrid,
	};
})

const createEmptyGrid = ({ width, height }: BoardShape): PuzzleGrid => {
	return array2d<PuzzleValue>(width, height, EMPTY)
}

const resizeGrid = <T>(grid: T[][], width: number, height: number, defaultValue: T): T[][] => {
	const currentWidth = grid[0].length;
	const currentHeight = grid.length;

	if (currentWidth === width && currentHeight === height) {
		return grid;
	}

	// Create a new array with the specified dimensions
	const newArray: T[][] = [];

	for (let i = 0; i < height; i++) {
		const newRow: T[] = [];

		for (let j = 0; j < width; j++) {
			// If the cell exists in the old array, copy its value; otherwise, use the default value
			if (i < currentHeight && j < currentWidth) {
				newRow.push(grid[i][j]);
			} else {
				newRow.push(defaultValue);
			}
		}

		newArray.push(newRow);
	}

	return newArray;
}

const getRotatedGrid = (dir: 'cw' | 'ccw', grid: PuzzleGrid): {
	grid: PuzzleGrid,
	width: number,
	height: number,
} => {
	const fn = dir === 'cw' ? rotate90 : rotate270;
	const result = fn(grid);

	return {
		grid: fn(grid),
		width: result[0].length,
		height: result.length,
	}
}