import { computed, type Ref } from "vue";
import type { ElementDimensions } from "./useThrottledElementSizeObserver.js";
import type { Vec } from "@/lib/types.js";

export type GridPuzzleShapeRefs = Record<'width' | 'height', Ref<number>>;
export type GridRulerSizeRefs = Record<'width' | 'height', Ref<'cellSize' | string>>;
export type GridInfobarSizeRefs = Record<'height', Ref<string>>;
export type GridPaddingRefs = Record<keyof Vec, Ref<string>>;

const MIN_CELL_SIZE = 14;
const MAX_CELL_SIZE = 80;

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
	// TODO: does this need to be a separate computed value?
	const aspectRatio = computed(() => {
		return columnsWithRuler.value / rowsWithRuler.value;
	})

	const unavailableHeight = computed(() => {
		let result = 0;
		if (paddingY.value !== 'cellSize') {
			const paddingNum = convertPxToNumber(paddingY.value);
			result += (paddingNum * 2); // padding is calculated twice, once for top and once for bottom
		}
		if (rulerHeight.value !== 'cellSize') {
			const rulerNum = convertPxToNumber(rulerHeight.value);
			result += rulerNum;
		}
		if (infoHeight.value !== 'cellSize') {
			const infobarNum = convertPxToNumber(infoHeight.value);
			result += infobarNum;
		}
		return result;
	})
	const unavailableWidth = computed(() => {
		let result = 0;
		if (paddingX.value !== 'cellSize') {
			const paddingNum = convertPxToNumber(paddingX.value);
			result += (paddingNum * 2); // padding is calculated twice, once for left and once for right
		}
		if (rulerWidth.value !== 'cellSize') {
			const rulerNum = convertPxToNumber(rulerWidth.value);
			result += rulerNum;
		}
		return result;
	})

	const maxWidth = computed(() => availableSize.value.width - unavailableWidth.value);
	const maxHeight = computed(() => availableSize.value.height - unavailableHeight.value);

	const puzzleGridDimensions = computed(() => {
		let cellSize: number;

		const potentialHeightFromMaxWidth = maxWidth.value / aspectRatio.value;
		if (potentialHeightFromMaxWidth < maxHeight.value) {
			// entire available width can be used, so the cellSize should be based on the available width
			cellSize = clamp(
				MIN_CELL_SIZE,
				Math.floor(potentialHeightFromMaxWidth / rowsWithRuler.value),
				MAX_CELL_SIZE
			);
		} else {
			// entire available height can be used, so cellSize should be based on available height
			const potentialWidthFromMaxHeight = maxHeight.value * aspectRatio.value;
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

function convertPxToNumber(pxString: string, fallback?: number): number {
	const result = parseInt(pxString, 10);
	if (Number.isNaN(result)) {
		if (fallback == null) throw new Error(`Invalid input: ${pxString} is not a valid pixel value`);
		return fallback;
	}
	return result;
}
function clamp(min: number, value: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}