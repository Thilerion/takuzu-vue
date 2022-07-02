import { ONE, ZERO } from "../constants.js";
import { getRecurringValuesFromPermutations } from "./utils.js";

export function humanSolveElimination({ board }, options = {}) {
	
	const results = [];

	const {
		least: leastRemainingRange = [1, 3],
	} = options;

	const mostRemainingRange = [1, 10];

	const lines = [...board.boardLines()];
	const filteredLines = lines.filter(boardLine => {
		const remainingOne = boardLine.getValueRemaining(ONE);
		const remainingZero = boardLine.getValueRemaining(ZERO);
		const least = Math.min(remainingOne, remainingZero);
		const most = Math.max(remainingZero, remainingOne);
		boardLine._least = least;
		boardLine._most = most;

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

		results.push({ targets, technique: 'elimination', elimType: `${boardLine._least}-${boardLine._most}`, source: [boardLine.lineId] });
	}

	return results;
}


function getValidLinePermutations(boardLine) {
	return boardLine.validPermutations;
}