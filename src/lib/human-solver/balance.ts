
import { EMPTY } from "../constants";
import { checkLineBalanceStrategy2 } from "../solvers/common/LineBalanceStrategy.js";
import type { LineId, Target } from "../types";
import type { HumanTechniqueBoardOnly } from "./types";

export type BalanceTechniqueResult = {
	technique: 'balance',
	targets: Target[],
	origin: [LineId]
}
export function humanSolveBalance({ board }: HumanTechniqueBoardOnly) {
	const results: BalanceTechniqueResult[] = [];
	
	for (const boardLine of board.boardLines()) {
		const result = checkLineBalanceStrategy2(boardLine);

		if (!result.found) continue;

		const { value } = result.data;
		const targets = [];

		for (let i = 0; i < boardLine.length; i++) {
			if (boardLine.values[i] === EMPTY) {
				targets.push({ ...boardLine.getCoords(i), value });
			}
		}

		results.push({ 
			technique: 'balance',
			targets,
			origin: [boardLine.lineId],
		});
	}
	return results;
}