import { EMPTY, ONE, ZERO } from "../constants.js"

export const createFilterLinesByRemainingValues = (leastRange, mostRange) => {
	if (leastRange.length !== 2 || mostRange.length !== 2) {
		throw new Error('Can only filter with ranges of length 2.');
	}
	return (boardLine) => {
		if (boardLine.isFilled) return false;

		const remOne = boardLine.getValueRemaining(ONE);
		const remZero = boardLine.getValueRemaining(ZERO);
		
		const [least, most] = [remOne, remZero].sort();

		// TODO: this should not be necessary...
		boardLine._least = least;
		boardLine._most = most;

		return least >= leastRange[0] && least <= leastRange[1] && most >= mostRange[0] && most <= mostRange[1];
	}
}

export function getRecurringValuesFromPermutations(boardLine, permutations) {
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