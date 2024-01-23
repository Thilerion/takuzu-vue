import type { BoardLine } from "../board/BoardLine";
import { COLUMN, ROW } from "../constants";
import type { LineArrSymbolPermutations } from "../permutations";
import { getRecurringValuesFromPermutations, removeFilledLinesFromPermutationsWithSources } from "../solvers/common/EliminationStrategy.js";
import type { LineId, Target } from "../types";
import { areLinesEqual } from "../utils";
import type { FilledLineRecord, ElimTechniqueOpts, HumanTechniqueBoardOnly } from "./types";
import { createFilterLinesByRemainingValues } from "./utils";

export type DuplicateLineTechniqueResult = {
	targets: Target[],
	technique: 'elim-duplicate',
	elimType: `${number}-${number}`,
	source: LineId[],
	targetLine: LineId
};

export function humanSolveDuplicateLine({ board }: HumanTechniqueBoardOnly, {
	least: leastRemainingRange = [1, 2],
	most: mostRemainingRange = [1, 10]
}: ElimTechniqueOpts = {}): DuplicateLineTechniqueResult[] | { error: string } {
	const results: DuplicateLineTechniqueResult[] = [];

	const lines: BoardLine[] = [...board.boardLines()];
	const filterByRemValues = createFilterLinesByRemainingValues(leastRemainingRange, mostRemainingRange);

	const filteredLines = lines.filter(filterByRemValues).sort((lineA, lineB): number => {
		const leastDiff = lineA.leastRem - lineB.leastRem;
		if (leastDiff !== 0) return leastDiff;
		return lineA.mostRem - lineB.mostRem;
	});

	const filledLines = findFilledLines(lines);
	if (!filledLines || (!filledLines[ROW].length && !filledLines[COLUMN].length)) {
		return [];
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
		} = removeFilledLinesFromPermutationsWithSources(validPerms, filled)
		console.warn({ permsDupesFiltered, sources });
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
			elimType: `${boardLine.leastRem}-${boardLine.mostRem}`,
			source: [...sources],
			targetLine: boardLine.lineId
		});
	}
	return results;
}

function findFilledLines(lines: BoardLine[]): FilledLineRecord {
	return lines.reduce<FilledLineRecord>((acc, line) => {
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