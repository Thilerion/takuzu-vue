
import { EMPTY } from "../constants";
import { checkLineBalanceStrategy } from "../strategies/LineBalance";
import type { LineId, Target } from "../types";
import type { HumanTechniqueBoardOnly } from "./types";

type BalanceTechniqueResult = {
	technique: 'balance',
	targets: Target[],
	origin: [LineId]
}
export function humanSolveBalance({ board }: HumanTechniqueBoardOnly) {
	const results: BalanceTechniqueResult[] = [];
	
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

		results.push({ 
			technique: 'balance',
			targets,
			origin: [boardLine.lineId],
		});
	}
	return results;
}