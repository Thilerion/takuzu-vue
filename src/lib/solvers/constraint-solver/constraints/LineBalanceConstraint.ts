import type { SimpleBoard } from "@/lib/board/Board.js"
import { checkLineBalanceStrategy } from "../../common/LineBalanceStrategy.js";
import { EMPTY } from "@/lib/constants.js";
import type { BoardLine } from "@/lib/board/BoardLine.js";
import type { ConstraintResult } from "./types.js";

export type ApplyLineBalanceConstraintOpts = {
	/** Whether to stop after applying to a single line. Defaults to true. */
	singleAction: boolean
}
export type ApplyLineBalanceConstraintDeps = {
	/** The function to use to gather the boardLines to check. Defaults to `board.boardLines()` */
	gatherBoardLines?: (board: SimpleBoard) => Iterable<BoardLine>,
}

export function applyLineBalanceConstraint(
	board: SimpleBoard,
	opts: ApplyLineBalanceConstraintOpts = { singleAction: true },
	deps: Partial<ApplyLineBalanceConstraintDeps> = {}
): ConstraintResult {
	const { singleAction } = opts;
	let changed = false;

	const boardLines = deps.gatherBoardLines ?? (board => board.boardLines());

	for (const boardLine of boardLines(board)) {
		const res = checkLineBalanceStrategy(boardLine);
		if (res.found) {
			const { value } = res.data;
			// TODO: maybe add a Board.fillLine() which fills the empty cells with a symbol?
			const lineValues = boardLine.values.map(v => v === EMPTY ? value : v);
			board.assignLine(boardLine.lineId, lineValues);
			changed = true;

			if (singleAction) return { changed };
		}
	}

	return { changed };
}

export const applyLineBalanceConstraintWithOpts = (opts: ApplyLineBalanceConstraintOpts) => (board: SimpleBoard) => applyLineBalanceConstraint(board, opts);