import type { SimpleBoard } from "@/lib/index.js"
import { checkLineBalanceStrategy2 } from "../../common/LineBalanceStrategy.js";
import { EMPTY, type PuzzleSymbol } from "@/lib/constants.js";
import type { BoardLine } from "@/lib/board/BoardLine.js";
import type { ConstraintResult } from "./types.js";

export type ApplyLineBalanceConstraintOpts = {
	/** Whether to stop after applying to a single line. Defaults to true. */
	singleAction?: boolean
}
export type ApplyLineBalanceConstraintDeps = {
	/** The function to use to gather the boardLines to check. Defaults to `board.boardLines()` */
	gatherBoardLines?: (board: SimpleBoard) => Iterable<BoardLine>,
}

export function applyLineBalanceConstraint(
	board: SimpleBoard,
	opts: ApplyLineBalanceConstraintOpts = {},
	deps: Partial<ApplyLineBalanceConstraintDeps> = {}
): ConstraintResult {
	const { singleAction = false } = opts;
	let changed = false;

	const boardLines = deps.gatherBoardLines ?? (board => board.boardLines());

	for (const boardLine of boardLines(board)) {
		const res = checkLineBalanceStrategy2(boardLine);
		if (res.found) {
			const { value } = res.data;
			// TODO: use Board.assignLine()? or Board.fillLine()?
			const lineValues = boardLine.values.map(v => v === EMPTY ? value : v);
			board.assignLine(boardLine.lineId, lineValues);
			changed = true;

			if (singleAction) return { changed };
		}
	}

	return { changed };
}