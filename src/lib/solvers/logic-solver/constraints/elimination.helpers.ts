import type { BoardLine } from "@/lib/board/BoardLine.js";
import type { ApplyEliminationConstraintOptsParam, ApplyEliminationConstraintValidatedOpts } from "./EliminationConstraint.js";

// OPTIONS
const elimConstraintDefaultOptions = {
	singleAction: true,
	useDuplicateLines: true,
	leastRemainingRange: [1, 3],
	maxEmptyCells: 10
} as const satisfies Required<ApplyEliminationConstraintOptsParam>

export const mergeAndValidateElimConstraintOpts = (opts: ApplyEliminationConstraintOptsParam): ApplyEliminationConstraintValidatedOpts => {
	const defaultOptions = elimConstraintDefaultOptions;
	const baseLeastRemainingRange = opts.leastRemainingRange ?? defaultOptions.leastRemainingRange;
	const minLeast = baseLeastRemainingRange[0] ?? 1;
	const maxLeast = baseLeastRemainingRange[1] ?? Infinity;
	const leastRemainingRange = [minLeast, maxLeast] as [number, number];
	if (minLeast > maxLeast) throw new Error(`minLeast (${minLeast}) cannot be greater than maxLeast (${maxLeast})`);
	return { ...defaultOptions, ...opts, leastRemainingRange };
}

// DEPS
export type BoardLineCategory = 'filled' | 'process' | 'skip';
export type CategorizeBoardLineFn = (line: BoardLine, opts: ApplyEliminationConstraintValidatedOpts) => BoardLineCategory;

export const categorizeBoardLine: CategorizeBoardLineFn = (
	line: BoardLine,
	opts: ApplyEliminationConstraintValidatedOpts
) => {
	if (line.isFilled) {
		if (opts.useDuplicateLines) {
			return 'filled';
		}
		return 'skip';
	}
	if (line.numFilled <= 0) return 'skip'; // previously was <= 1 which might have been more efficient, but possibly missed some cases for small board sizes
	else if (line.numEmpty > opts.maxEmptyCells) return 'skip';
	const leastRem = line.getLeastRemaining();
	const [minLeast, maxLeast] = opts.leastRemainingRange;
	if (leastRem <= maxLeast && leastRem >= minLeast) {
		return 'process';
	}
	return 'skip';
}

export type PrioritySortBoardLinesFn = (a: BoardLine, b: BoardLine) => number;
export const defaultSortLinesByPriority: PrioritySortBoardLinesFn = (a, b) => {
	// chance for a result is largest when difference between the lines of least and most is largest
		// and we want the easiest results first, especially if "singleAction" is true

		// no problem with calling this here repeatedly, as it is cached inside the BoardLine class
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
}