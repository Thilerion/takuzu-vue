import { COLUMN, EMPTY, ROW } from "../../constants";
import { areLinesEqual } from "../../utils";

export default function applyEliminationConstraint(board, options = {}) {
	let changed = false;

	const {
		singleAction = true,
		enforceUniqueLines = true,
		maxLeast = 3, // reduce for easier game generation
	} = options;

	const allLines = [...board.boardLines()];

	let filledLines = findFilledLines(allLines, enforceUniqueLines);

	// TODO: filter here instead of checking during the loop
	const linesToProcess = [...allLines].filter(boardLine => {
		if (boardLine.isFilled) return false;
		if (boardLine.numFilled <= 1) return false;
		if (maxLeast != null && boardLine.getLeastRemaining() > maxLeast) return false;
		return true;
	}).sort((a, b) => {
		// chance for a result is largest when difference between least and most is largest
		// and we want the easiest results first

		const aLeast = a.getLeastRemaining();
		const bLeast = b.getLeastRemaining();

		if (aLeast !== bLeast) {
			return aLeast - bLeast;
		}

		const aMost = a.getMostRemaining();
		const bMost = b.getMostRemaining();
		if (aMost !== bMost) {
			return bMost - aMost;
		}
		return 0;
	})

	for (const boardLine of linesToProcess) {

		const filled = filledLines[boardLine.type];

		// get line permutations (valid)
		const validPermutations = getValidLinePermutations(boardLine);
		// if none: error, no valid possibility for line
		if (!validPermutations || !validPermutations.length) {
			return { error: 'No valid line permutations' };
		}

		// filter out duplicate Lines
		const filteredPermutations = filterOutDuplicateLines(validPermutations, filled);
		// if none: error, no valid possibility for line
		if (!filteredPermutations || !filteredPermutations.length) {
			return { error: 'No valid line permutations' };
		}

		// get any values/cells that are present/recurring in each permutation
		const targets = getRecurringValuesFromPermutations(boardLine, filteredPermutations);
		// if none: continue; no elimination possible for this line
		if (!targets || !targets.length) continue;

		const changedRows = new Set();
		const changedCols = new Set();
		// else if found: apply targets to board, set any changed rows and cols
		for (const action of targets) {
			const { x, y, value } = action;
			board.assign(x, y, value);
			changedRows.add(y);
			changedCols.add(x);
		}

		if (singleAction) {
			return true;
		}

		changed = true;
		// reset all lines that had one or more values changed
		for (const l of linesToProcess) {
			if (l.type === ROW && changedRows.has(l.index)) {
				l.reset(board);
			} else if (l.type === COLUMN && changedCols.has(l.index)) {
				l.reset(board);
			}
		}
		// add current line to filled Lines if it is now filled
		if (boardLine.isFilled && enforceUniqueLines) {
			filled.push(boardLine);
		}
		// continue with loop
	}

	return changed;
}

function findFilledLines(lines, enforceUniqueLines = true) {
	const filled = {
		[ROW]: [],
		[COLUMN]: []
	}

	if (!enforceUniqueLines) return filled;

	for (const boardLine of lines) {
		if (boardLine.isFilled) {
			filled[boardLine.type].push(boardLine);
		}
	}

	return filled;
}

function getValidLinePermutations(boardLine) {
	return boardLine.validPermutations;
}

function filterOutDuplicateLines(linePerms, filledLines = []) {
	if (!filledLines.length) return [...linePerms];
	return linePerms.filter((perm) => {
		const isDuplicate = filledLines.find(l => areLinesEqual(perm, l.values));
		return isDuplicate == null;
	})
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
