import { COLUMN, ROW } from "../constants.js";
import { areLinesEqual } from "../utils.js";
import { createFilterLinesByRemainingValues, getRecurringValuesFromPermutations } from "./utils.js";

export function humanSolveDuplicateLine({ board }, options = {}) {
	const results = [];

	const {
		least: leastRemainingRange = [1, 2],
		most: mostRemainingRange = [1, 10]
	} = options;

	const lines = [...board.boardLines()];
	const filterByRemValues = createFilterLinesByRemainingValues(leastRemainingRange, mostRemainingRange);

	const filteredLines = lines.filter(filterByRemValues).sort((lineA, lineB) => {
		const leastDiff = lineA._least - lineB._least;
		if (leastDiff !== 0) return leastDiff;
		return lineA._most - lineB._most;
	});
	console.log({ filteredLines });

	const filledLines = findFilledLines(lines);
	if (!filledLines || (!filledLines[ROW].length && !filledLines[COLUMN].length)) {
		return results;
	}
		

	for (const boardLine of filteredLines) {
		const filled = filledLines[boardLine.type];
		if (!filled || !filled.length) continue;

		const validPerms = boardLine.validPermutations;
		if (!validPerms || !validPerms.length) {
			return { error: 'No valid line permutations' };
		}

		if (validPerms.length === 1) {
			return { error: 'This is a standard elimination, no duplicate line check necessary. Should have been caught earlier.' };
		}

		// filter out duplicate lines
		const {
			result: permsDupesFiltered,
			sources
		} = filterOutDuplicateLines(validPerms, filled);
		console.log({ permsDupesFiltered, sources });
		if (!permsDupesFiltered || !permsDupesFiltered.length) {
			return { error: 'No valid line permutations after potential duplicate lines were removed.' };
		} else if (!sources || !sources.length) {
			continue;
		}

		// TODO: this does not say anything about which source lines contributed to elimination of values
		// get any values/cells that are present/recurring in each permutation
		const targets = getRecurringValuesFromPermutations(boardLine, permsDupesFiltered);
		// if none: continue; no elimination possible for this line
		if (!targets || !targets.length) continue;

		results.push({
			targets,
			technique: 'elim-duplicate',
			elimType: `${boardLine._least}-${boardLine._most}`,
			source: [...sources],
			targetLine: boardLine.lineId
		});
	}
	return results;
}

function findFilledLines(lines) {
	return lines.reduce((acc, line) => {
		if (line.isFilled) {
			const { type } = line;
			acc[type].push(line);
		}
		return acc;
	}, {
		[ROW]: [],
		[COLUMN]: []
	})
}

function filterOutDuplicateLines(linePerms, filledLines = []) {
	if (!filledLines.length) return [...linePerms];
	
	const result = [];
	const sources = [];

	for (const perm of linePerms) {
		const dupeFound = filledLines.find(l => areLinesEqual(perm, l.values));
		if (dupeFound) {
			sources.push(dupeFound.lineId);
		} else {
			result.push(perm);
		}
	}
	return { result, sources };
}