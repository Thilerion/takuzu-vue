import { COLUMN, EMPTY, ONE, ROW, ZERO } from "../constants";
import { areLinesEqual } from "../utils";

export function humanSolveElimination({ board, solution }, options = {}) {
	
	const results = [];

	const leastRemainingRange = [1, 3];
	const mostRemainingRange = [1, 8];

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

	// console.log({ filteredLines });

	// const filledLines = findFilledLines(lines, true);

	for (const boardLine of filteredLines) {
		// const filled = filledLines[boardLine.type];

		const validPermutations = getValidLinePermutations(boardLine);
		// if none: error, no valid possibility for line
		if (!validPermutations || !validPermutations.length) {
			return { error: 'No valid line permutations' };
		}
		// TODO: filter out duplicate Lines
		// const filteredPermutations = filterOutDuplicateLines(validPermutations, filled);
		// // if none: error, no valid possibility for line
		// if (!filteredPermutations || !filteredPermutations.length) {
		// 	return { error: 'No valid line permutations' };
		// }

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

function getRecurringValuesFromPermutations(boardLine, permutations) {
	const { values, length } = boardLine;

	if (permutations.length === 1) {
		// just use all values in this single permutation
		return permutations[0].reduce((acc, val, idx) => {
			if (values[idx] === EMPTY) {
				const { x, y } = boardLine.getCoords(idx);
				acc.push({ x, y, value: val });
			}
			return acc;
		}, []);
	}

	const recurringValues = [];
	for (let i = 0; i < length; i++) {
		// for each place in the line, check the values of all permutations
		if (values[i] !== EMPTY) continue;

		const permValueFirst = permutations[0][i];
		const isRecurring = permutations.every(otherPermVals => otherPermVals[i] === permValueFirst);
		if (isRecurring) {
			const { x, y } = boardLine.getCoords(i);
			recurringValues.push({ x, y, value: permValueFirst });
		}
	}
	return recurringValues;
}