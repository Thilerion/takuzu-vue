import type { PuzzleValue } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import type { LineCounts } from "@/lib/types.js";
import { countLineValues } from "@/lib/utils.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { createSharedComposable } from "@vueuse/core";
import { watchEffect, ref } from "vue";

export const useLineCounts = createSharedComposable(() => {
	const puzzleStore = usePuzzleStore();
	
	const rowCounts = ref<LineCounts | null>(null);
	const colCounts = ref<LineCounts | null>(null);
	
	const initializeCounts = () => {
		if (puzzleStore.board == null) {
			return;
		}
		const result = calculateLineCounts(puzzleStore.board!);
		rowCounts.value = result.rowCounts;
		colCounts.value = result.colCounts;
	}

	watchEffect(() => {
		if (puzzleStore.board == null) {
			rowCounts.value = null;
			colCounts.value = null;
		} else {
			initializeCounts();
		}
	})

	puzzleStore.$onAction(({
		name,
		args,
		after
	}) => {
		if (name !== '_setValue') return;
		const { x, y, value, prevValue } = args[0];
		after(() => {
			if (rowCounts.value == null || colCounts.value == null) {
				initializeCounts();
				return;
			}
			rowCounts.value[y][value] += 1;
			rowCounts.value[y][prevValue] -= 1;
			colCounts.value[x][value] += 1;
			colCounts.value[x][prevValue] -= 1;
		})
	})

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