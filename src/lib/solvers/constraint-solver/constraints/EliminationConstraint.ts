import type { BoardLine } from "@/lib/board/BoardLine.js";
import { ROW, type LineType, COLUMN } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import { checkEliminationStrategy } from "../../common/EliminationStrategy.js";
import type { ConstraintResult } from "./types.js";
import type { Target } from "@/lib/types.js";
import { mergeAndValidateElimConstraintOpts, type CategorizeBoardLineFn, categorizeBoardLine, type PrioritySortBoardLinesFn, defaultSortLinesByPriority } from "./elimination.helpers.js";


export type ApplyEliminationConstraintOptsParam = {
	/** Whether to stop after applying to a single line. Defaults to true. */
	singleAction?: boolean,
	/** Whether to find filled lines on the board, and use those to reduce the search space. Applies to Elim_duplicate constraints. Defaults to true. */
	useDuplicateLines?: boolean,
	/** The range of "leastRemaining" to consider; when the max is higher, this strategy will search for harder to find patterns. Defaults to [1, 3] */
	leastRemainingRange?: [min: number | null, max: number | null],
	/** The maximum amount of empty cells a line can have. Lower numbers reduce effectiveness of this function, but improve performance as a smaller amount of lines need to be checked, and generating completions/permutations of lines with many empty cells is resource-intensive. Defaults to 10. */
	maxEmptyCells?: number
}
export type ApplyEliminationConstraintValidatedOpts = Omit<Required<ApplyEliminationConstraintOptsParam>, 'leastRemainingRange'> & { leastRemainingRange: [number, number ]};

type ApplyEliminationConstraintDeps = {
	categorizeLine: CategorizeBoardLineFn,
	sortLinesByPriority: PrioritySortBoardLinesFn
}

export function applyEliminationConstraint(
	board: SimpleBoard,
	options: ApplyEliminationConstraintOptsParam = {},
	deps: Partial<ApplyEliminationConstraintDeps> = {}
): ConstraintResult {
	let changed = false;
	const mergedOpts = mergeAndValidateElimConstraintOpts(options);
	const {
		singleAction,
		useDuplicateLines,
	} = mergedOpts;

	const {
		categorizeLine = categorizeBoardLine,
		sortLinesByPriority = defaultSortLinesByPriority
	} = deps;

	const { filledLines, boardLines } = categorizeBoardLines(
		board.boardLines(),
		mergedOpts,
		{ categorizeLine, sort: sortLinesByPriority }
	);

	for (const boardLine of boardLines) {
		const lineRes = applyEliminationConstraintOnSingleLine(board, boardLine, filledLines, !singleAction);
		if ('error' in lineRes) {
			return { changed: false, error: lineRes.error };
		}
		if (!lineRes.changed) continue;
		if (singleAction) {
			return { changed: true };
		}
		changed = true;

		// Update (or reset) the (cached values of) each BoardLine that was changed by the assigned values
		// TODO: maybe a BoardLine.update(x, y, value) method would be better
		if (lineRes.changedLines) {
			updateBoardLinesWithChanges(boardLines, board, lineRes.changedLines);
		} else {
			throw new Error('No changed lines in result, but singleAction was false...')
		}

		// if the current line is now completely filled, add it to the filled lines
		if (boardLine.isFilled && useDuplicateLines) {
			filledLines[boardLine.type] = [
				...filledLines[boardLine.type],
				boardLine
			]
		}
	}

	return { changed };
}

function applyEliminationConstraintOnSingleLine(
	board: SimpleBoard,
	boardLine: BoardLine,
	filledLines: Record<LineType, BoardLine[]>,
	trackChanges: boolean
): { error: string } | { changed: false } | { changed: true, changedLines: ({ row: number, column: number }[]) | null } {
	const filled = filledLines[boardLine.type];
    const strategyResult = checkEliminationStrategy(boardLine, filled);
    if (!strategyResult.found && strategyResult.invalid) {
        return { error: strategyResult.error };
    }

    if (!strategyResult.found) return { changed: false };

    const { targets } = strategyResult.data;
    applyTargets(board, targets);

	if (trackChanges) {
		return { changed: true, changedLines: targets.map(t => ({ row: t.y, column: t.x })) };
	} else {
		return { changed: true, changedLines: null };
	}
}

/**
 * Reset (the cached values in) all BoardLines that have changed, based on the given changes.
 * TODO: maybe a BoardLine.update(x, y, value) method would be better
 * TODO: filledLines should also be updated 
 */
function updateBoardLinesWithChanges(
	lines: BoardLine[],
	board: SimpleBoard,
	changes: { row: number, column: number }[]
): void {
	const changedRows = new Set<number>([...changes.map(l => l.row)]);
	const changedCols = new Set<number>([...changes.map(l => l.column)]);
	for (const line of lines) {
		if (line.type === ROW && changedRows.has(line.index)) {
			line.reset(board);
		} else if (line.type === COLUMN && changedCols.has(line.index)) {
			line.reset(board);
		}
	}
}

function applyTargets(board: SimpleBoard, targets: Target[]): void {
	targets.forEach(tg => board.assignTarget(tg));
}

export function categorizeBoardLines(
	lines: Iterable<BoardLine>,
	opts: ApplyEliminationConstraintValidatedOpts,
	deps: { categorizeLine: CategorizeBoardLineFn, sort: PrioritySortBoardLinesFn }
) {
	const filledLines: Record<LineType, BoardLine[]> = {
		[ROW]: [],
		[COLUMN]: []
	}
	const linesToProcess: BoardLine[] = [];

	for (const bl of lines) {
		const category = deps.categorizeLine(bl, opts);
		switch(category) {
			case 'filled':
				filledLines[bl.type].push(bl);
				break;
			case 'process':
				linesToProcess.push(bl);
				break;
			case 'skip':
				break;
			default: {
				const x: never = category;
				throw new Error(`Unknown category (${x}) for board line in applyEliminationConstraint`);
			}
		}
	}

	return {
		filledLines,
		boardLines: [...linesToProcess].sort(deps.sort)
	}
}