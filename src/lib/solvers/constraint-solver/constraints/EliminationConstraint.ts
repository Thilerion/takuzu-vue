import type { BoardLine } from "@/lib/board/BoardLine.js";
import { ROW, type LineType, COLUMN } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/board/Board.js";
import { checkEliminationStrategy } from "../../common/EliminationStrategy.js";
import type { ConstraintResult } from "./types.js";
import type { Target } from "@/lib/types.js";
import { mergeAndValidateElimConstraintOpts, type CategorizeBoardLineFn, categorizeBoardLine, type PrioritySortBoardLinesFn, defaultSortLinesByPriority } from "./elimination.helpers.js";

/*
	ApplyEliminationConstraint function consists of 3 steps:
	1. Validate and merge options with defaults
	2. Gather boardLines, assign categories (skip, process, or filled), and sort by priority
	3. Apply the elimination strategy to each boardLine
		3a. If singleAction is true, stop after the first boardLine that has changed
		3b. If singleAction is false, continue to the next boardLine after updating the boardLines that were changed by the actions of this line
*/

// TODO: useDuplicateLines option should be required, to prevent accidentally using a "duplicate line" strategy when not desired

export type ApplyEliminationConstraintOptsParam = {
	/** Whether to stop after applying to a single line. Defaults to true. */
	singleAction: boolean,
	/** Whether to find filled lines on the board, and use those to reduce the search space. Applies to Elim_duplicate constraints. Defaults to true. */
	useDuplicateLines?: boolean,
	/** The range of "leastRemaining" to consider; when the max is higher, this strategy will search for harder to find patterns. Defaults to [1, 3] */
	leastRemainingRange?: [min: number | null, max: number | null],
	/** The maximum amount of empty cells a line can have. Lower numbers reduce effectiveness of this function, but improve performance as a smaller amount of lines need to be checked, and generating completions/permutations of lines with many empty cells is resource-intensive. Defaults to 10. */
	maxEmptyCells?: number
}
export type ApplyEliminationConstraintValidatedOpts = Omit<Required<ApplyEliminationConstraintOptsParam>, 'leastRemainingRange'> & { leastRemainingRange: [number, number ]};

type ApplyEliminationConstraintDeps = {
	gatherBoardLines: (board: SimpleBoard) => Iterable<BoardLine>,
	assignLineCategory: CategorizeBoardLineFn,
	sortLinesByPriority: PrioritySortBoardLinesFn
}
type BoardLineChanges = Record<LineType, Set<number>>;

export function applyEliminationConstraint(
	board: SimpleBoard,
	options: ApplyEliminationConstraintOptsParam = { singleAction: true },
	deps: Partial<ApplyEliminationConstraintDeps> = {}
): ConstraintResult {
	let changed = false;
	const mergedOpts = mergeAndValidateElimConstraintOpts(options);
	const {
		singleAction,
		useDuplicateLines,
	} = mergedOpts;

	const {
		gatherBoardLines,
		assignLineCategory = categorizeBoardLine,
		sortLinesByPriority = defaultSortLinesByPriority
	} = deps;

	const { filledLines, boardLines } = categorizeBoardLines(
		gatherBoardLines?.(board) ?? board.boardLines(),
		mergedOpts,
		{ assignLineCategory, sort: sortLinesByPriority }
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
		if (lineRes.changedLines) {
			updateBoardLinesWithChanges(boardLines, board, lineRes.changedLines);
		} else {
			throw new Error('No changed lines in result, but singleAction was false...')
		}

		// if the current line is now completely filled, add it to the filled lines
		// TODO: maybe also update filledLines in the other direction; if this is a row with multiple values placed in this step, the columns in which those were placed could also have become a filled line
		if (boardLine.isFilled && useDuplicateLines) {
			filledLines[boardLine.type] = [
				...filledLines[boardLine.type],
				boardLine
			]
		}
	}

	return { changed };
}

export const applyEliminationConstraintWithOpts = (opts: ApplyEliminationConstraintOptsParam) => (board: SimpleBoard) => applyEliminationConstraint(board, opts);

function applyEliminationConstraintOnSingleLine(
	board: SimpleBoard,
	boardLine: BoardLine,
	filledLines: Record<LineType, BoardLine[]>,
	trackChanges: boolean
): { error: string } | { changed: false } | { changed: true, changedLines: (BoardLineChanges) | null } {
	const filled = filledLines[boardLine.type];
    const strategyResult = checkEliminationStrategy(boardLine, filled);
    if (!strategyResult.found && strategyResult.invalid) {
        return { error: strategyResult.error };
    }

    if (!strategyResult.found) return { changed: false };

    const { targets } = strategyResult.data;
    applyTargets(board, targets);

	if (trackChanges) {
		const changedLines = targets.reduce((acc, val) => {
			acc[ROW].add(val.y);
			acc[COLUMN].add(val.x);
			return acc;
		}, { [ROW]: new Set<number>(), [COLUMN]: new Set<number>() } as BoardLineChanges);
		return { 
			changed: true, 
			changedLines 
		};
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
	changes: BoardLineChanges
): void {
	const {
		[ROW]: changedRows,
		[COLUMN]: changedCols
	} = changes;
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
	deps: { assignLineCategory: CategorizeBoardLineFn, sort: PrioritySortBoardLinesFn }
) {
	const filledLines: Record<LineType, BoardLine[]> = {
		[ROW]: [],
		[COLUMN]: []
	}
	const linesToProcess: BoardLine[] = [];

	for (const bl of lines) {
		const category = deps.assignLineCategory(bl, opts);
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