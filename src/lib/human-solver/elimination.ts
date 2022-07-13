import type { BoardLine } from "../board/BoardLine";
import type { LineId, Target } from "../types";
import type { ElimTechniqueOpts, HumanTechniqueBoardOnly } from "./types";
import { getRecurringValuesFromPermutations } from "./utils";

export type ElimTechniqueResult = {
	technique: 'elimination',
	elimType: `${number}-${number}`,
	source: LineId[],
	targets: Target[]
};
export function humanSolveElimination({ board }: HumanTechniqueBoardOnly, {
	least: leastRemainingRange = [1, 10],
	most: mostRemainingRange = [1, 10]
}: ElimTechniqueOpts = {}): ElimTechniqueResult[] | { error: string } {
	
	const results: ElimTechniqueResult[] = [];

	const lines: BoardLine[] = [...board.boardLines()];
	const filteredLines = lines.filter(boardLine => {
		const least = boardLine.leastRem;
		const most = boardLine.mostRem;

		return !boardLine.isFilled && least >= leastRemainingRange[0] && least <= leastRemainingRange[1] && most >= mostRemainingRange[0] && most <= mostRemainingRange[1];
	})

	for (const boardLine of filteredLines) {

		const validPermutations = getValidLinePermutations(boardLine);
		// if none: error, no valid possibility for line
		if (!validPermutations || !validPermutations.length) {
			return { error: 'No valid line permutations' };
		}

		// get any values/cells that are present/recurring in each permutation
		const targets = getRecurringValuesFromPermutations(boardLine, validPermutations);
		// if none: continue; no elimination possible for this line
		if (!targets || !targets.length) continue;

		results.push({
			targets,
			technique: 'elimination',
			elimType: `${boardLine.leastRem}-${boardLine.mostRem}`,
			source: [boardLine.lineId]
		});
	}

	return results;
}


function getValidLinePermutations(boardLine: BoardLine) {
	return boardLine.validPermutations;
}