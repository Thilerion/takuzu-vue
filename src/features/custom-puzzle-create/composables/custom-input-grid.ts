import { createSharedComposable, toReactive, toRef, useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import type { BoardShape, PuzzleGrid } from "@/lib/types.js";
import { array2d } from "@/utils/array2d.utils.js";
import { EMPTY, type PuzzleValue } from "@/lib/constants.js";
import { clamp } from "@/utils/number.utils.js";

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

export const CUSTOM_PUZZLE_MIN_SIZE = 4;
export const CUSTOM_PUZZLE_MAX_SIZE = 16;

export const useCustomPuzzleInputGrid = createSharedComposable(() => {
	const stateRef = useLocalStorage<CustomPuzzleInputGridData>(
		"takuzu_customPuzzleInputData",
		getDefaultData(),
		{
			deep: true,
			writeDefaults: true,
		}
	);
	const state = toReactive(stateRef);

	const customPuzzleGrid = toRef<CustomPuzzleInputGridData, 'grid'>(state, "grid");

	const forceSquareGrid = computed({
		get: () => stateRef.value.forceSquareGrid,
		set: (value) => {
			stateRef.value.forceSquareGrid = value;
			if (value && stateRef.value.height !== stateRef.value.width) {
				stateRef.value.height = stateRef.value.width;
			}
		}
	});
	const width = computed({
		get: () => stateRef.value.width,
		set: (value) => {
			stateRef.value.width = clamp(CUSTOM_PUZZLE_MIN_SIZE, value, CUSTOM_PUZZLE_MAX_SIZE);
			if (stateRef.value.forceSquareGrid) {
				stateRef.value.height = value;
			}
		}
	});
	const height = computed({
		get: () => stateRef.value.height,
		set: (value) => {
			stateRef.value.height = clamp(CUSTOM_PUZZLE_MIN_SIZE, value, CUSTOM_PUZZLE_MAX_SIZE);
			if (stateRef.value.forceSquareGrid) {
				stateRef.value.width = value;
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

	return {
		dimensions,
		forceSquareGrid,
		width,
		height,
		customPuzzleGrid,

		updateDimensions,
		resetGrid,
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