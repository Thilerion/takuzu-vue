import { EMPTY, ONE, ZERO } from "@/lib/constants";
import { countLineValues } from "@/lib/utils";

// whenever the board object changes, recheck line counts
export const calculateLineCounts = (board) => {
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

export const calculateGridCounts = (board) => {
	const counts = { [ONE]: 0, [ZERO]: 0, [EMPTY]: 0 };
	for (const cell of board.cells({ skipEmpty: false })) {
		counts[cell.value] += 1;
	}
	return counts;
}