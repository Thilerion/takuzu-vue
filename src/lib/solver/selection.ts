import type { SimpleBoard } from "../board/Board";
import { EMPTY, ONE, ZERO, type PuzzleSymbol } from "../constants";
import type { LineId, Vec } from "../types";
import { countLineValues } from "../utils";

export function selectCellFirstEmpty(board: SimpleBoard): Vec | null {
	for (let y = 0; y < board.height; y++) {
		const row = board.getRow(y);
		const firstEmpty = row.indexOf(EMPTY);
		if (firstEmpty > -1) {
			return { x: firstEmpty, y };
		}
	}
	return null;
}

export function selectCellFewestEmptyPeers(board: SimpleBoard, targetEmptyRatio = 0.7): Vec | null {
	const numCells = board.width * board.height;
	const emptyRatio = board.numEmpty / numCells; // percentage of empty cells

	// if percentage empty cells higher than 70%, this heuristic is not fast enough to matter
	// so first empty cell should be returned
	if (emptyRatio > targetEmptyRatio) {
		return selectCellFirstEmpty(board);
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

export function selectCellRandom(board: SimpleBoard): Vec {
	const emptyCells = board.cells({ skipFilled: true, shuffled: true });
	const nextVal = emptyCells.next().value;
	if (nextVal) {
		const { x, y } = nextVal;
		return { x, y };
	}
	throw new Error('No next value found.');
}

type SelectValueFn = (board: SimpleBoard, x: number, y: number) => PuzzleSymbol;

export const selectValueZeroFirst: SelectValueFn = (board, x, y) => ZERO;
export const selectValueRandom: SelectValueFn = (board, x, y) => Math.random() < 0.5 ? ONE : ZERO;

/* 
Select value that is used the least among the cells' peers (least constraining value in CSP).
Greatly decreases search time while generating, or for boards that need a lot of backtracking in general; less useful for boards that require less backtracking, but not really detrimental.
Using LCV; the algorithm is more likely to go along a correct path, and the fewest returns in the search are required
*/
export const selectValueLeastConstraining: SelectValueFn = (board, x, y) => {
	const row = board.getRow(y);
	const col = board.getColumn(x);

	const rowCount = countLineValues(row);
	const colCount = countLineValues(col);

	if (rowCount[ONE] + colCount[ONE] < rowCount[ZERO] + colCount[ZERO]) {
		return ONE;
	} else {
		return ZERO;
	}
}

export const selectCell = {
	'first_empty': selectCellFirstEmpty,
	'random': selectCellRandom,
	'fewest_empty_peers': selectCellFewestEmptyPeers
}

export const selectValue = {
	'zero_first': selectValueZeroFirst,
	'random': selectValueRandom,
	'least_constraining': selectValueLeastConstraining
};