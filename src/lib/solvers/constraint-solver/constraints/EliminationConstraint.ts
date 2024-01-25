import type { BoardLine } from "@/lib/board/BoardLine.js";
import { ROW, type LineType, COLUMN } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import { checkEliminationStrategy } from "../../common/EliminationStrategy.js";
import type { ConstraintResult } from "./types.js";
import type { Target } from "@/lib/types.js";


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
type ApplyEliminationConstraintValidatedOpts = Omit<Required<ApplyEliminationConstraintOptsParam>, 'leastRemainingRange'> & { leastRemainingRange: [number, number ]};
const defaultOptions: Required<ApplyEliminationConstraintOptsParam> = {
	singleAction: true,
	useDuplicateLines: true,
	leastRemainingRange: [1, 3],
	maxEmptyCells: 10
}
const mergeAndValidateOptions = (opts: ApplyEliminationConstraintOptsParam): ApplyEliminationConstraintValidatedOpts => {
	const baseLeastRemainingRange = opts.leastRemainingRange ?? defaultOptions.leastRemainingRange;
	const minLeast = baseLeastRemainingRange[0] ?? 1;
	const maxLeast = baseLeastRemainingRange[1] ?? Infinity;
	const leastRemainingRange = [minLeast, maxLeast] as [number, number];
	if (minLeast > maxLeast) throw new Error(`minLeast (${minLeast}) cannot be greater than maxLeast (${maxLeast})`);
	return { ...defaultOptions, ...opts, leastRemainingRange };
}

export function applyEliminationConstraint(
	board: SimpleBoard,
	options: ApplyEliminationConstraintOptsParam = {}
): ConstraintResult {
	let changed = false;
	const {
		singleAction,
		useDuplicateLines,
		leastRemainingRange,
		maxEmptyCells
	} = mergeAndValidateOptions(options);
	const [minLeast, maxLeast] = leastRemainingRange;

	const { filledLines, boardLines } = categorizeBoardLines(
		board.boardLines(),
		useDuplicateLines,
		minLeast,
		maxLeast,
		maxEmptyCells,
	);

	for (const boardLine of boardLines) {
		const singleResult = applyEliminationConstraintOnSingleLine(board, boardLine, filledLines, singleAction);
		if ('error' in singleResult) {
			return { changed: false, error: singleResult.error };
		}
		if (!singleResult.changed) continue;
		if (singleAction) {
			return { changed: true };
		}
		changed = true;

		// track the changed row and column indices, so the boardLines can be reset
		// now reset the lines where one or more values were changed
		// TODO: maybe a BoardLine.update(x, y, value) method would be better
		updateBoardLinesWithChanges(boardLines, board, singleResult.changedLines!);

		// if the current line is now completely filled, add it to the filled lines
		if (boardLine.isFilled && useDuplicateLines) {
			filledLines[boardLine.type].push(boardLine);
		}
		// continue with loop
	}

	return { changed };
}

function updateBoardLinesWithChanges(lines: BoardLine[], board: SimpleBoard, changes: { row: number, column: number }[]) {
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

function applyTargets(board: SimpleBoard, targets: Target[]): void {
	for (const { x, y, value } of targets) {
		board.assign(x, y, value);
	}
}

function categorizeBoardLines(
	lines: Iterable<BoardLine>,
	useDuplicateLines: boolean,
	minLeast: number,
	maxLeast: number,
	maxEmptyCells: number
) {
	const filledLines: Record<LineType, BoardLine[]> = {
		[ROW]: [],
		[COLUMN]: []
	}
	const linesToProcess: BoardLine[] = [];

	for (const bl of lines) {
		if (bl.isFilled) {
			if (useDuplicateLines) {
				const lineType = bl.type;
				filledLines[lineType].push(bl);
			}
			continue;
		}
		if (bl.numFilled <= 0) continue; // previously was <= 1 which might have been more efficient, but possibly missed some cases for small board sizes
		if (bl.numEmpty > maxEmptyCells) continue;
		const leastRem = bl.getLeastRemaining();
		if (leastRem <= maxLeast && leastRem >= minLeast) {
			linesToProcess.push(bl);
		}
	}

	return {
		filledLines,
		boardLines: sortLinesByPriority(linesToProcess)
	}
}

function sortLinesByPriority(lines: readonly BoardLine[]): BoardLine[] {
	return [...lines].sort((a: BoardLine, b: BoardLine) => {
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
	})
}