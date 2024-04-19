import { usePuzzleEvent } from "@/composables/puzzle-events.js";
import type { PuzzleValue } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import type { LineCounts, VecValueChange } from "@/lib/types.js";
import { countLineValues } from "@/lib/utils/puzzle-line.utils";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { createSharedComposable } from "@vueuse/core";
import { ref, watch } from "vue";

export const useLineCounts = createSharedComposable(() => {
	const puzzleStore = usePuzzleStore();
	
	const rowCounts = ref<LineCounts | null>(null);
	const colCounts = ref<LineCounts | null>(null);
	
	const initializeCounts = () => {
		if (puzzleStore.board == null) {
			return;
		}
		const result = calculateLineCounts(puzzleStore.board);
		rowCounts.value = result.rowCounts;
		colCounts.value = result.colCounts;
	}

	watch(() => puzzleStore.board, (board, prev) => {
		if (board == null) {
			rowCounts.value = null;
			colCounts.value = null;
			return;
		} else if (board !== prev) {
			// entire board has changed, or was set initially
			initializeCounts();
		}
	}, { immediate: true, deep: false });

	usePuzzleEvent("value-change", (change: VecValueChange) => {
		if (rowCounts.value == null || colCounts.value == null) {
			initializeCounts();
			return;
		}
		updateCountsWithChange(rowCounts.value, colCounts.value, change);
	});

	return {
		rowCounts,
		colCounts,
	}
})

function calculateLineCounts(board: SimpleBoard): { rowCounts: Record<PuzzleValue, number>[], colCounts: Record<PuzzleValue, number>[] } {
	const rowCounts = board.grid.map(row => {
		return countLineValues(row);
	})
	const colCounts = [];
	for (let x = 0; x < board.width; x++) {
		const col = board.getColumn(x);
		const count = countLineValues(col);
		colCounts.push(count);
	}
	return { rowCounts, colCounts };
}

function updateCountsWithChange(rowCounts: LineCounts, colCounts: LineCounts, change: VecValueChange) {
	const { x, y, value, prevValue } = change;
	rowCounts[y][value]++;
	colCounts[x][value]++;
	rowCounts[y][prevValue]--;
	colCounts[x][prevValue]--;
}