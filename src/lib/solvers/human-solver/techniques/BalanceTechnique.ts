import type { BoardLine } from "@/lib/board/BoardLine";
import { EMPTY } from "@/lib/constants";
import type { LineId, Target } from "@/lib/types";
import { checkLineBalanceStrategy } from "../../common/LineBalanceStrategy";

export type BalanceTechniqueResult = {
	technique: 'balance',
	targets: Target[],
	lineId: LineId // previously: origin: [LineId]
};

export type HumanBalanceTechniqueParams = {
	// or: SimpleBoard class
	board: {
		boardLines: () => Iterable<BoardLine>
	}
}

/**
 * Finds targets that can be filled on a board using the balance technique.
 * The starting point is the pattern that a human sees: a line that has all cells filled of one symbol,
 * and the remaining cells require the opposite symbol.
 * Therefore, the result is a list of targets that can be filled in a specific line with one specific value.
 */
export function humanBalanceTechnique({ board }: HumanBalanceTechniqueParams): BalanceTechniqueResult[] {
	const results: BalanceTechniqueResult[] = [];
	
	for (const boardLine of board.boardLines()) {
		const result = checkLineBalanceStrategy(boardLine);

		if (!result.found) continue;

		const { value } = result.data;
		const targets: Target[] = [];

		for (let i = 0; i < boardLine.length; i++) {
			if (boardLine.values[i] === EMPTY) {
				targets.push({ ...boardLine.getCoords(i), value });
			}
		}

		results.push({ 
			technique: 'balance',
			targets,
			lineId: boardLine.lineId,
		});
	}
	return results;
}
