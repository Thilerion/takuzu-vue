import type { BoardLine } from "@/lib/board/BoardLine.js";
import { ROW, type LineType, COLUMN } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import { checkEliminationStrategy } from "../../common/EliminationStrategy.js";
import type { ConstraintResult } from "./types.js";
import type { Target } from "@/lib/types.js";


export type ApplyEliminationConstraintOpts = {
	/** Whether to stop after applying to a single line. Defaults to true. */
	singleAction?: boolean,
	/** Whether to find filled lines on the board, and use those to reduce the search space. Applies to Elim_duplicate constraints. Defaults to true. */
	useDuplicateLines?: boolean,
	/** The range of "leastRemaining" to consider; when the max is higher, this strategy will search for harder to find patterns. Defaults to [1, 3] */
	leastRemainingRange?: [min: number | null, max: number | null],
	/** The maximum amount of empty cells a line can have. Lower numbers reduce effectiveness of this function, but improve performance as a smaller amount of lines need to be checked, and generating completions/permutations of lines with many empty cells is resource-intensive. Defaults to 10. */
	maxEmptyCells?: number
}

export function applyEliminationConstraint(
	board: SimpleBoard,
	options: ApplyEliminationConstraintOpts = {}
): ConstraintResult {
	let changed = false;
	const {
		singleAction = true,
		useDuplicateLines = true,
		leastRemainingRange = [1, 3],
		maxEmptyCells = 10
	} = options;
	const minLeast = leastRemainingRange[0] ?? 1;
	const maxLeast = leastRemainingRange[1] ?? Infinity;
	if (minLeast > maxLeast) throw new Error(`minLeast (${minLeast}) cannot be greater than maxLeast (${maxLeast})`);

	const { filledLines, boardLines } = getFilledLinesAndLinesToProcess(
		board.boardLines(),
		useDuplicateLines,
		minLeast,
		maxLeast,
		maxEmptyCells,
	);

	for (const boardLine of boardLines) {
		const filled = filledLines[boardLine.type];

		const strategyResult = checkEliminationStrategy(boardLine, filled);
		if (!strategyResult.found && strategyResult.invalid) {
			const { error } = strategyResult;
			return { changed: false, error };
		}

		if (!strategyResult.found) {
			continue;
		}

		const { targets } = strategyResult.data;

		if (singleAction) {
			applyTargets(board, targets);
			return { changed: true };
		}

		changed = true;

		// apply target here, tracking the changed row and column indices, so the boardLines can be reset
		const { changedRows, changedCols } = applyTargetsAndTrackChangedLines(board, targets);
		// now reset the lines where one or more values were changed
		// TODO: maybe a BoardLine.update() method would be better
		for (const otherLine of boardLines) {
			if (otherLine.type === ROW && changedRows.has(otherLine.index)) {
				otherLine.reset(board);
			} else if (otherLine.type === COLUMN && changedCols.has(otherLine.index)) {
				otherLine.reset(board);
			}
		}

		// if the current line is now completely filled, add it to the filled lines
		if (boardLine.isFilled && useDuplicateLines) {
			filledLines[boardLine.type].push(boardLine);
		}
		// continue with loop
	}

	return { changed };
}

function applyTargets(board: SimpleBoard, targets: Target[]): void {
	for (const { x, y, value } of targets) {
		board.assign(x, y, value);
	}
}
function applyTargetsAndTrackChangedLines(board: SimpleBoard, targets: Target[]) {
	const changedRows = new Set<number>();
	const changedCols = new Set<number>();
	for (const { x, y, value } of targets) {
		board.assign(x, y, value);
		changedRows.add(y);
		changedCols.add(x);
	}
	return { changedRows, changedCols };
}

function getFilledLinesAndLinesToProcess(
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
		boardLines: sortedBoardLinesByDifficulty(linesToProcess)
	}
}

function sortedBoardLinesByDifficulty(lines: readonly BoardLine[]): BoardLine[] {
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