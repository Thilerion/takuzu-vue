import { EMPTY } from "../../constants";
import { checkLineBalanceStrategy } from "../../strategies/LineBalance";

export default function applyLineBalanceConstraint(board, options = {}) {
	let changed = false;

	const { singleAction = false } = options;

	for (const boardLine of board.boardLines()) {
		const { found, value } = checkLineBalanceStrategy(boardLine);

		if (!found) continue;

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