
import { EMPTY } from "../constants.js";
import { checkLineBalanceStrategy } from "../strategies/LineBalance.js";

export function humanSolveBalance(data, options = {}) {
	const { board } = data;

	const results = [];
	
	for (const boardLine of board.boardLines()) {
		const result = checkLineBalanceStrategy(boardLine);

		if (!result.found) continue;

		const { value } = result;

		const targets = [];

		for (let i = 0; i < boardLine.length; i++) {
			if (boardLine.values[i] === EMPTY) {
				targets.push({ ...boardLine.getCoords(i), value });
			}
		}

		const origin = [boardLine.lineId];
		results.push({ targets, origin });
	}
	return results;
}