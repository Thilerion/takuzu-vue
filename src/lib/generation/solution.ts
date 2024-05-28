import { sample } from "@/utils/random.utils.js";
import { SimpleBoard } from "../board/Board.js";
import { COLUMN, ROW, type LineType } from "../constants.js";
import { getValidLinesOfSize } from "../line-generation/memoized.js";
import type { BoardShape, LineId, PuzzleSymbolLineStr } from "../types.js";
import { lineIndexToLineId, splitLine } from "../utils/puzzle-line.utils.js";
import { ConstraintSolver } from "../solvers/constraint-solver/ConstraintSolver.js";
import { clamp } from "@/utils/number.utils.js";

/**
 * Generates a completely filled and valid solution board of specific dimensions.
 * Optimized for speed, so the solver automatically uses a timeout in DFS.
 * Defaults to 5 attempts, when the solver cannot, or cannot quickly, find a solution.
 * During the last attempt, the timeout is increased by 500ms.
 */
export function generateSolutionBoard(
	width: number, height: number,
	maxAttempts = 5,
): SimpleBoard | null {
	const baseSolverTimeout = getMaxSolverDuration(width, height);
	const fillData = getInitialFillData(width, height);
	const shape = { width, height };

	try {
		for (let i = 0; i < maxAttempts; i++) {
			const solverTimeout = i === maxAttempts - 1 ? baseSolverTimeout + 500 : baseSolverTimeout;
			const board = initialFillEmptyBoard(shape, fillData);
			const solution = runSolverToFindSolution(board, solverTimeout);
	
			if (solution) return solution;
		}
	} catch(e) {
		console.error(`An error occurred while generating a solution board: ${e}. This is possibly a timeout error?`);
		return null;
	}
	
	console.warn(`Failed to generate a solution board after ${maxAttempts} attempts, with a max time of ${baseSolverTimeout}ms per attempt.`);
	return null;
}

/**
 * Calculates the maximum solver duration based on the puzzle dimensions, empirically determined.
 * @returns The maximum solver duration in milliseconds, between 100 and 2000.
 */
function getMaxSolverDuration(width: number, height: number): number {
	const n = width + height;
	// A cubic function that starts at 100, and grows to 1122 at a 14x14 board.
	const value = (Math.pow(n + 1, 3)) / 3.3 + 100;
	// Clamp to a max of 2000 just in case. Min is not necessary as the function starts at 100, but is there in case the function changes.
	return clamp(100, Math.round(value), 2000);
}

export type InitialFillData = {
	possibleLines: ReadonlyArray<PuzzleSymbolLineStr>,
	/** Line indexes to initially fill */
	linesToFill: LineId[],
	axis: LineType,
};

/**
 * Determines the initial fill data based on the puzzle dimensions.
 * The first and last lines are always kept empty during initial fill.
 * Between each filled line, there are always 2 empty lines for more consistently valid results.
 */
export function getInitialLinesToFill(
	initialFillType: LineType,
	dims: BoardShape
): LineId[] {
	// If initialFillType is ROW, entire rows are assigned. The number of rows is numLines.
	// Then, get "getLineId" would be yToRowId.
	let numLines: number;

	if (initialFillType === ROW) {
		numLines = dims.height;
	} else {
		numLines = dims.width;
	}

	if (numLines <= 6) {
		return [lineIndexToLineId(initialFillType, 1)];
	}

	// Select lines to fill randomly from all possible lines of the size
	// There should be 2 empty lines between all initially-filled lines for consistent, and valid, results
	const linesToFill: LineId[] = [];
	for (let i = 1; i < numLines - 2; i += 3) {
		linesToFill.push(lineIndexToLineId(initialFillType, i));
	}
	return linesToFill;
}

/**
 * Determines the initial fill data based on the puzzle dimensions.
 * 
 * Either rows or columns will initially be filled, depending on which is smaller.
 * Starting with smaller is better than starting with larger, as tested:
 * The average time to generate many boards was about 20% faster with this approach.
 * It was tested by generating many boards, so the memoization of the possible lines was not a factor in the difference.
 */
export function getInitialFillData(width: number, height: number): InitialFillData {
	const initialFillSize = Math.min(width, height);
	const initialFillType = width === initialFillSize ? ROW : COLUMN;
	const possibleLines = getValidLinesOfSize(initialFillSize);

	const linesToFill = getInitialLinesToFill(initialFillType, { width, height });

	return { possibleLines, linesToFill, axis: initialFillType };
}

/** Creates an empty board of a specific shape, and fills some lines according to the initial fill data. */
function initialFillEmptyBoard(dims: BoardShape, fillData: InitialFillData): SimpleBoard {
	const board = SimpleBoard.empty(dims);
	const { possibleLines, linesToFill } = fillData;
	
	const numLines = linesToFill.length;
	// Pick randomly from the possible lines, the amount of lines to fill (without replacement)
	const lines = sample(possibleLines, numLines);

	for (let i = 0; i < numLines; i++) {
		const id = linesToFill[i];
		const linestr = lines[i];
		const lineArr = splitLine(linestr);
		board.assignLine(id, lineArr);
	}

	/* Because enough empty lines were left between the filled lines,
	 * the board should be valid at this point.
	 * @24-4-2024: Never had a problem in entire time of developing that the result was invalid. But this check is kept
	 * in case something else changes in the function.
	 * The only way the board could be invalid is if too many lines are filled, and a symbol is used too often in a line. */
	if (import.meta.env.DEV) {
		if (!board.isValid()) {
			throw new Error('Board is not valid after the initial fill during solution generation.');
		}
	}

	return board;
}

/** Runs the ConstraintSolver with the goal of finding a (any) solution, in the fastest way possible.
 *  Uses the given timeout to limit the time spent on the dfs if needed.
 *  Optimized for speed, so constraints are automatically selected. */
function runSolverToFindSolution(
	board: SimpleBoard,
	timeout: number,
): SimpleBoard | null {
	const results = ConstraintSolver.quickFindAnySolution(board, {
		dfs: {
			timeout,
			throwAfterTimeout: false,
			// TODO: SelectCell and SelectValue might be faster with a different setting
			// At least some randomization is useful here, as it can help to avoid getting stuck in retries. However, initialFill also has randomization.
			selectCell: 'firstEmpty',
			selectValue: 'random',
		}
	});

	if (!results.solvable) {
		return null;
	} else return results.solutions[0];
}