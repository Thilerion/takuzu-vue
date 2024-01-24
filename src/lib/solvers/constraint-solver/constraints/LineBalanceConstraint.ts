import type { SimpleBoard } from "@/lib/index.js"
import { checkLineBalanceStrategy2 } from "../../common/LineBalanceStrategy.js";
import { EMPTY, type PuzzleSymbol } from "@/lib/constants.js";
import type { BoardLine } from "@/lib/board/BoardLine.js";
import type { ConstraintResult } from "./types.js";

export type ApplyLineBalanceConstraintOpts = {
	/** Whether to stop after applying to a single line */
	singleAction?: boolean
}

export function applyLineBalanceConstraints(
	board: SimpleBoard,
	options: ApplyLineBalanceConstraintOpts = {}
): ConstraintResult {
	let changed = false;
	const singleAction = options.singleAction ?? false;

	for (const boardLine of board.boardLines()) {
		const res = checkLineBalanceStrategy2(boardLine);
		if (!res.found) continue;

		const { value } = res.data;
		// TODO: use Board.assignLine()? or Board.fillEmptyWith()?
		fillEmptyCellsWithValue(board, boardLine, value);
		changed = true;
		
		if (singleAction) return { changed: true };
		else changed = true;
	}

	return { changed };
}

const fillEmptyCellsWithValue = (board: SimpleBoard, line: BoardLine, value: PuzzleSymbol) => {
	for (let i = 0; i < line.length; i++) {
		if (line.values[i] === EMPTY) {
			const { x, y } = line.coords[i];
			board.assign(x, y, value);
		}
	}
}