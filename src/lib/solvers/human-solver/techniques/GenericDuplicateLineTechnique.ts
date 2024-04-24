import type { Target, LineId, PuzzleValueLine } from "@/lib/types.js";
import { getRecurringValuesFromPermutations, removeFilledLinesFromPermutationsWithSources } from "../../common/EliminationStrategy.js";
import { assertValidLeastRemaining, createLinePredicateWithinLeastRemainingRange } from "./common-helpers.js";
import type { WithGetBoardLineIterableFn } from "./types.js";

export type GenericDuplicateLineTechniqueOpts = {
	leastRemaining: number | [min: number, max: number],
	maxEmptyCells?: number
}

export type GenericDuplicateLineTechniqueResult = {
	technique: 'dupeLine-generic';
	targets: Target[];
	remainingCounts: [least: number, most: number];
	line: LineId;
	lineValues: PuzzleValueLine;
	potentialDuplicateLines: LineId[];
}

export function genericDuplicateLineTechnique(
	{ board }: { board: WithGetBoardLineIterableFn },
	opts: GenericDuplicateLineTechniqueOpts
): GenericDuplicateLineTechniqueResult[] {
	assertValidLeastRemaining(opts.leastRemaining);
	const leastRemainingRange: [number, number] = Array.isArray(opts.leastRemaining) ? opts.leastRemaining : [opts.leastRemaining, opts.leastRemaining];

	const result: GenericDuplicateLineTechniqueResult[] = [];
	const boardLines = [...board.boardLines()];

	const filledRows = boardLines.filter(line => line.type === 'row' && line.isFilled);
	const filledColumns = boardLines.filter(line => line.type === 'column' && line.isFilled);
	const includeRows = filledRows.length > 0;
	const includeColumns = filledColumns.length > 0;

	if (!includeRows && !includeColumns) return [];

	// filter lines so they have the least remaining amount, or within the range
	const rangePredicate = createLinePredicateWithinLeastRemainingRange(
		leastRemainingRange,
		opts.maxEmptyCells
	);
	const filteredLines = boardLines.filter(line => {
		// because we care only about elim results as consequence of filled lines,
		// we can filter out any lines where the filled lines are empty
		const lineType = line.type;
		if (lineType === 'row' && !includeRows) return false;
		else if (lineType === 'column' && !includeColumns) return false;
		// also filter by leastRemaining and maxEmptyCells
		return rangePredicate(line);
	});

	if (!filteredLines.length) return [];

	for (const boardLine of filteredLines) {
		const filled = boardLine.type === 'row' ? filledRows : filledColumns;

		const possibleLineCompletions = boardLine.validPermutations;
		if (!possibleLineCompletions || !possibleLineCompletions.length) {
			// TODO: throw custom error here, same with GenericEliminationTechnique
			throw new Error('[UnsolvableBoardLineError]: Cannot complete "GenericDuplicateLineTechnique" due to invalid/unsolvable board state.');
		}
		if (possibleLineCompletions.length === 1) {
			// even without removing the filled lines, there is only one possible completed line, so the result would never be caused by potential duplicate lines
			continue;
		}

		const {
			result: filteredLineCompletions,
			sources: potentialDuplicateLines
		} = removeFilledLinesFromPermutationsWithSources(possibleLineCompletions, filled);

		if (!filteredLineCompletions.length) {
			// TODO: throw custom error here, same with GenericEliminationTechnique
			throw new Error('[UnsolvableBoardLineError]: Cannot complete "GenericDuplicateLineTechnique" due to invalid/unsolvable board state.');
		} else if (!potentialDuplicateLines.length) {
			// no filled lines were used to filter the possible line completions
			continue;
		}

		const targets = getRecurringValuesFromPermutations(boardLine, filteredLineCompletions);
		if (!targets.length) continue;

		const remainingCounts = [boardLine.leastRem, boardLine.mostRem] as [number, number];
		result.push({
			technique: 'dupeLine-generic',
			targets,
			remainingCounts,
			line: boardLine.lineId,
			lineValues: [...boardLine.values],
			potentialDuplicateLines
		});
	}

	return result;
}