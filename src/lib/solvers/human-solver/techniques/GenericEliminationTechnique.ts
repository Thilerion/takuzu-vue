import type { LineId, PuzzleValueLine, Target } from "@/lib/types.js"
import { checkEliminationStrategy } from "../../common/EliminationStrategy.js"
import type { WithGetBoardLineIterableFn } from "./types.js";
import { assertValidLeastRemaining, createLinePredicateWithinLeastRemainingRange } from "./common-helpers.js";

export type EliminationLeastRemainingRange = [min: number, max: number];
export type EliminationLeastRemaining = number | EliminationLeastRemainingRange;

export type HumanGenericElimTechniqueInputData = {
	// or: SimpleBoard class
	board: WithGetBoardLineIterableFn
}
export type HumanGenericElimTechniqueOpts = {
	leastRemaining: EliminationLeastRemaining,
	maxEmptyCells: number,
}

export type GenericEliminationTechniqueResult = {
	technique: 'elim-generic';
	targets: Target[];
	remainingCounts: [least: number, most: number];
	line: LineId;
	lineValues: PuzzleValueLine;
  }

export function genericEliminationTechnique(
	{ board }: HumanGenericElimTechniqueInputData,
	opts: {
		leastRemaining: EliminationLeastRemainingRange,
	} & Partial<Omit<HumanGenericElimTechniqueOpts, 'leastRemaining'>>
): GenericEliminationTechniqueResult[] {
	assertValidLeastRemaining(opts.leastRemaining);
	
	const result: GenericEliminationTechniqueResult[] = [];
	const boardLines = [...board.boardLines()];

	// filter lines so they have the least remaining amount, or within the range
	const rangePredicate = createLinePredicateWithinLeastRemainingRange(
		opts.leastRemaining,
		opts.maxEmptyCells
	);
	const filteredLines = boardLines.filter(line => rangePredicate(line));

	// for each line, run the elimination strategy, explicitly without filledLines (as that is purpose of the duplicate line strategy)
	for (const line of filteredLines) {
		const lineResult = checkEliminationStrategy(line);
		// if error found, exit early, return error that indicates board is invalid
		if (lineResult.invalid && lineResult.error) {
			// TODO: throw custom error here, and handle a potential custom error  thrown by checkEliminationStrategy
			throw new Error('[UnsolvableBoardLineError]: Cannot complete "GenericEliminationTechnique" due to invalid/unsolvable board state.');
		}
		// if no result found; continue with next line
		if (!lineResult.found) continue;

		// if result found, push to result array after gathering least and most remaining amounts
		const { targets } = lineResult.data;
		const remainingCounts = [line.leastRem, line.mostRem] as [number, number];
		result.push({
			technique: 'elim-generic',
			targets,
			remainingCounts,
			line: line.lineId,
			lineValues: [...line.values]
		});
	}	

	return result;
}

export function createGenericEliminationTechnique(leastRemaining: number | [min: number, max: number]) {
	const leastRemainingRange = Array.isArray(leastRemaining) ? leastRemaining : [leastRemaining, leastRemaining] as [number, number];
	assertValidLeastRemaining(leastRemainingRange);
	return (data: HumanGenericElimTechniqueInputData, opts: Omit<Parameters<typeof genericEliminationTechnique>[1], 'leastRemaining'> = {}) => {
		return genericEliminationTechnique(data, { ...opts, leastRemaining: leastRemainingRange });
	}
}