import type { BoardLine } from "@/lib/board/BoardLine.js"
import type { LineId, Target } from "@/lib/types.js"
import { checkEliminationStrategy } from "../../common/EliminationStrategy.js"

export type EliminationLeastRemainingRange = [min: number, max: number];
export type EliminationLeastRemaining = number | EliminationLeastRemainingRange;

export type HumanGenericElimTechniqueInputData = {
	// or: SimpleBoard class
	board: {
		boardLines: () => Iterable<BoardLine>
	}
}
export type HumanGenericElimTechniqueOpts = {
	leastRemaining: EliminationLeastRemaining,
}

export type GenericEliminationTechniqueResult = {
	technique: 'elim-generic';
	targets: Target[];
	remainingCounts: [least: number, most: number];
	line: LineId;
  }

export function genericEliminationTechnique(
	{ board }: HumanGenericElimTechniqueInputData,
	opts: {
		leastRemaining: EliminationLeastRemainingRange
	}
): GenericEliminationTechniqueResult[] {
	const result: GenericEliminationTechniqueResult[] = [];
	const boardLines = [...board.boardLines()];

	// filter lines so they have the least remaining amount, or within the range
	// TODO: extract filtering functionality, used in other Elimination techniques/strategies
	const filteredLines = boardLines.filter(line => {
		if (line.isFilled) return false;
		if (line.numFilled === 0) return false;
		// TODO: maxEmptyCells?
		const leastRem = line.getLeastRemaining();
		const [min, max] = opts.leastRemaining;
		return leastRem >= min && leastRem <= max;
	});
	// TODO: also sort by least remaining amount, but not needed if opts.leastRem is not a range

	// for each line, run the elimination strategy, explicitly without filledLines (as that is purpose of the duplicate line strategy)
	for (const line of filteredLines) {
		const lineResult = checkEliminationStrategy(line);
		// if error found, exit early, return error that indicates board is invalid TODO
		if ('error' in result) {
			// TODO: return error object here
			throw new Error('Cannot complete "GenericEliminationTechnique" due to invalid/unsolvable board state.');
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
			line: line.lineId
		});
	}	

	return result;
}

export function createGenericEliminationTechnique(leastRemaining: number | [min: number, max: number]) {
	const leastRemainingRange = Array.isArray(leastRemaining) ? leastRemaining : [leastRemaining, leastRemaining] as [number, number];
	return (data: HumanGenericElimTechniqueInputData, opts: Partial<Omit<HumanGenericElimTechniqueOpts, 'leastRemaining'>> = {}) => {
		return genericEliminationTechnique(data, { ...opts, leastRemaining: leastRemainingRange });
	}
}