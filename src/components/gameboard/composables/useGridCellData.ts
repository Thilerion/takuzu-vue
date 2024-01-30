import { EMPTY, type PuzzleValue } from "@/lib/constants.js";
import type { PuzzleGrid, Vec, XYKey } from "@/lib/types.js";
import { watch, ref, type Ref } from "vue";

export type GridStaticCellData = Vec & {
	locked: boolean;
	initialValue: PuzzleValue;
	key: XYKey; // x,y key, used in accessing Maps wit data for a specific cell
	listKey: string; // key used in v-for list
}

const getGridStaticCellData = (
	width: number,
	height: number,
	initialGrid: PuzzleGrid
) => {
	const staticCellData: GridStaticCellData[] = [];

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const initialValue = initialGrid[y][x];
			const locked = initialValue !== EMPTY;
			const listKey = [x, y, locked ? 1 : 0, initialValue].join(',');
			const key: XYKey = `${x},${y}`;
			staticCellData.push({ x, y, listKey, locked, initialValue, key });
		}
	}
	return staticCellData;
}

export function useStaticGridCellData(
	width: Ref<number>,
	height: Ref<number>,
	initialGrid: Ref<PuzzleGrid | undefined>
) {
	const staticCellData = ref<GridStaticCellData[]>([]);

	watch([width, height, initialGrid], ([w, h, initialGridValue]) => {
		if (initialGridValue == null) return;
		const res = getGridStaticCellData(w, h, initialGridValue);
		staticCellData.value = res;
	}, { immediate: true });

	return staticCellData;
}