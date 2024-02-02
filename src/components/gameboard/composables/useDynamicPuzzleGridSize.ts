import { computed, type Ref } from "vue";
import type { ElementDimensions } from "./useThrottledElementSizeObserver.js";
import type { Vec } from "@/lib/types.js";
import { clamp } from "@/utils/number.utils.js";

export type GridPuzzleShapeRefs = Record<'width' | 'height', Ref<number>>;
export type GridRulerSizeRefs = Record<'width' | 'height', Ref<'cellSize' | number | null>>;
export type GridInfobarSizeRefs = Record<'height', Ref<'cellSize' | number | null>>;
export type GridPaddingRefs = Record<keyof Vec, Ref<number>>;

const MIN_CELL_SIZE = 14;
const MAX_CELL_SIZE = 80;

// TODO: reduce possible over-reliance on intermediate computed values, which are always dependent on each other
export const useDynamicPuzzleGridSize = (
	availableSize: Ref<ElementDimensions>,
	puzzleSize: GridPuzzleShapeRefs,
	rulerSize: GridRulerSizeRefs,
	infobarSize: GridInfobarSizeRefs,
	padding: GridPaddingRefs
) => {
	const { width: rows, height: columns } = puzzleSize;
	const { height: rulerHeight, width: rulerWidth } = rulerSize;
	const { height: infoHeight } = infobarSize;
	const { x: paddingX, y: paddingY } = padding;

	// amount of rows/cols in final grid that have the a size equal to the cell size. The other rows/cols have a fixed size and are subtracted from the available height/width
	const rowsWithRuler = computed(() => {
		if (rulerHeight.value === 'cellSize') return rows.value + 1;
		return rows.value;
	})
	const columnsWithRuler = computed(() => {
		if (rulerWidth.value === 'cellSize') return columns.value + 1;
		return columns.value;
	})

	const unavailableHeight = computed(() => {
		let result = 0;
		if (paddingY.value) {
			result += (paddingY.value * 2); // padding is calculated twice, once for top and once for bottom
		}
		if (typeof rulerHeight.value === 'number') {
			result += rulerHeight.value;
		}
		if (typeof infoHeight.value === 'number') {
			result += infoHeight.value;
		}
		return result;
	})
	const unavailableWidth = computed(() => {
		let result = 0;
		if (paddingX.value) {
			result += (paddingX.value * 2); // padding is calculated twice, once for top and once for bottom
		}
		if (typeof rulerWidth.value === 'number') {
			result += rulerWidth.value;
		}
		return result;
	})

	const maxWidth = computed(() => availableSize.value.width - unavailableWidth.value);
	const maxHeight = computed(() => availableSize.value.height - unavailableHeight.value);

	const puzzleGridDimensions = computed(() => {
		let cellSize: number;

		const aspectRatio = columnsWithRuler.value / rowsWithRuler.value;

		const potentialHeightFromMaxWidth = maxWidth.value / aspectRatio;
		if (potentialHeightFromMaxWidth < maxHeight.value) {
			// entire available width can be used, so the cellSize should be based on the available width
			cellSize = clamp(
				MIN_CELL_SIZE,
				Math.floor(potentialHeightFromMaxWidth / rowsWithRuler.value),
				MAX_CELL_SIZE
			);
		} else {
			// entire available height can be used, so cellSize should be based on available height
			const potentialWidthFromMaxHeight = maxHeight.value * aspectRatio;
			cellSize = clamp(
				MIN_CELL_SIZE,
				Math.floor(potentialWidthFromMaxHeight / columnsWithRuler.value),
				MAX_CELL_SIZE
			);
		}
		const w = cellSize * columns.value;
		const h = cellSize * rows.value;
		return { width: w + "px", height: h + "px", cellSize };
	})

	return { puzzleGridDimensions };
}