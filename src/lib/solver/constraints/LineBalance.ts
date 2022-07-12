import type { SimpleBoard } from "@/lib/board/Board";
import { EMPTY } from "../../constants";
import { checkLineBalanceStrategy } from "../../strategies/LineBalance";

export type ApplyLineBalanceConstraintOpts = { singleAction?: boolean };
export default function applyLineBalanceConstraint(board: SimpleBoard, options: ApplyLineBalanceConstraintOpts = {}) {
	let changed = false;

	const { singleAction = false } = options;

	for (const boardLine of board.boardLines()) {
		const res = checkLineBalanceStrategy(boardLine);

		if (!res.found) continue;
		const { value } = res;
		// TODO: assignLine?
		for (let i = 0; i < boardLine.length; i++) {
			if (boardLine.values[i] === EMPTY) {
				const { x, y } = boardLine.coords[i];
				board.assign(x, y, value);
			}
		}
		if (singleAction) {
			// exit early, after the first line this constraint has been applied to
			return true;
		} else {
			changed = true;
		}
	}

	return changed;
}