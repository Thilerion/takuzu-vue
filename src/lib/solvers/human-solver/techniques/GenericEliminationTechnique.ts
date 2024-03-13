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
	maxEmptyCells: number,
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
		leastRemaining: EliminationLeastRemainingRange,
	} & Partial<Omit<HumanGenericElimTechniqueOpts, 'leastRemaining'>>
): GenericEliminationTechniqueResult[] {
	assertValidLeastRemaining(opts.leastRemaining);
	
	const result: GenericEliminationTechniqueResult[] = [];
	const boardLines = [...board.boardLines()];

	// filter lines so they have the least remaining amount, or within the range
	// TODO: extract filtering functionality, used in other Elimination techniques/strategies
	const filteredLines = boardLines.filter(line => {
		if (line.isFilled || line.numFilled === 0) return false;
		else if (opts.maxEmptyCells != null && line.numEmpty > opts.maxEmptyCells) return false;
		const leastRem = line.getLeastRemaining();
		const [min, max] = opts.leastRemaining;
		return leastRem >= min && leastRem <= max;
	});
	// TODO: also sort by least remaining amount, but not needed if opts.leastRem is not a range

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
			line: line.lineId
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

function assertValidLeastRemaining(value: EliminationLeastRemaining): void {
	const left = Array.isArray(value) ? value[0] : value;
	if (left <= 0) {
		throw new Error(`Least remaining lower bound cannot be 0 or lower, but got: ${left}`);
	}
	const right = Array.isArray(value) ? value[1] : value;
	if (right <= 0) {
		throw new Error(`Least remaining upper bound cannot be 0 or lower, but got: ${right}`);
	}
	if (Array.isArray(value) && right < left) {
		throw new Error(`Least remaining upper bound cannot be lower than lower bound, but got: ${right} < ${left}`);
	}
}