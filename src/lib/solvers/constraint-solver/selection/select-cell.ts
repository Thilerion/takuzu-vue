import { EMPTY } from "@/lib/constants.js";
import type { LineId, Vec } from "@/lib/types.js";
import type { SolverSelectCellFn } from "../types.js";
import type { SimpleBoard } from "@/lib/index.js";
import { countLineValues } from "@/lib/utils/puzzle-line.utils.js";

export const firstEmptyCell: SolverSelectCellFn = (board) => {
	const cellGen = board.cells({ skipEmpty: false, skipFilled: true });
	const first = cellGen.next().value;
	if (first) {
		return { x: first.x, y: first.y };
	} else return null;
}

const TARGET_EMPTY_RATIO = 0.7;
export const fewestEmptyPeersCell: SolverSelectCellFn = (board) => {
	const numCells = board.width * board.height;
	const emptyRatio = board.numEmpty / numCells; // percentage of empty cells

	// if percentage empty cells higher than 70%, this heuristic is not fast enough to matter
	// so first empty cell should be returned
	if (emptyRatio > TARGET_EMPTY_RATIO) {
		return firstEmptyCell(board);
	}

	let minVal = Infinity;
	let bestCell = null;

	const lineCounts = board.lineIds.reduce((acc, lineId) => {
		const line = board.getLine(lineId);
		const count = countLineValues(line);
		acc[lineId] = count;
		return acc;
	}, {} as Record<LineId, ReturnType<typeof countLineValues>>);

	for (const cell of board.cells({ skipFilled: true })) {
		const { x, y } = cell;
		const row = board.rowIds[y];
		const col = board.columnIds[x];

		const emptyPeersRow = lineCounts[row][EMPTY];
		const emptyPeersCol = lineCounts[col][EMPTY];
		const numEmptyPeers = emptyPeersCol + emptyPeersRow;

		if (numEmptyPeers < minVal) {
			minVal = numEmptyPeers;
			bestCell = { x, y };
		}
	}

	return bestCell;
}

export const randomCell = (board: SimpleBoard): Vec => {
	const emptyCells = board.cells({ skipFilled: true, shuffled: true });
	const nextVal = emptyCells.next().value;
	if (nextVal) {
		const { x, y } = nextVal;
		return { x, y };
	}
	throw new Error('No next value found.');
}