import { EMPTY } from "@/lib/constants.js";
import type { LineId, Vec } from "@/lib/types.js";
import type { SolverSelectCellFn } from "../types.js";
import { countLineValues } from "@/lib/utils/puzzle-line.utils.js";
import type { SimpleBoard } from "@/lib/board/Board.js";

export const firstEmptyCell: SolverSelectCellFn = (board) => {
	const cellGen = board.cells({ skipEmpty: false, skipFilled: true });
	const first = cellGen.next().value;
	if (first) {
		return { x: first.x, y: first.y };
	} else return null;
}

export const fewestEmptyPeersCell: SolverSelectCellFn = (board) => {
	let minVal = Infinity;
	let bestCell: Vec | null = null;

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

const DEFAULT_MAX_EMPTY_RATIO = 0.7;
/**
 * Creates a strategy that selects a cell that has the fewest empty peers.
 * It uses the maximum empty ratio with a fallback strategy if there are too many empty cells (for performance reasons).
 */
export const createFewestEmptyPeersCellSelectStrategy = (
	board: SimpleBoard,
	maxEmptyRatio = DEFAULT_MAX_EMPTY_RATIO,
	fallbackStrategy: SolverSelectCellFn = firstEmptyCell
) => {
	const numCells = board.width * board.height;
	const emptyRatio = board.getNumEmpty() / numCells; // percentage of empty cells

	// if percentage empty cells higher than 70%, this heuristic is not fast enough to matter
	// so another strategy should be used (such as first empty cell)
	if (emptyRatio > maxEmptyRatio) {
		return fallbackStrategy(board);
	}

	return fewestEmptyPeersCell(board);
}

export const randomCell: SolverSelectCellFn = (board) => {
	const emptyCells = board.cells({ skipFilled: true, shuffled: true });
	const nextVal = emptyCells.next().value;
	if (nextVal) {
		const { x, y } = nextVal;
		return { x, y };
	} else {
		return null;
	}
}