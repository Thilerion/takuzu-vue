import { sample } from "@/utils/random.utils.js";
import { SimpleBoard } from "../board/Board.js";
import { COLUMN, ROW, type LineType } from "../constants.js";
import { getValidLinesOfSize } from "../line-generation/memoized.js";
import type { BoardShape, LineId, PuzzleSymbolLineStr } from "../types.js";
import { splitLine, xToColumnId, yToRowId } from "../utils/puzzle-line.utils.js";
import { ConstraintSolver } from "../solvers/constraint-solver/ConstraintSolver.js";
import { clamp } from "@/utils/number.utils.js";

export function generateSolutionBoard(
	width: number, height: number,
	maxAttempts = 5,
): SimpleBoard | null {
	const solverTimeout = getMaxSolverDuration(width, height);
	const fillData = getInitialFillData(width, height);
	const shape = { width, height };

	for (let i = 0; i < maxAttempts; i++) {
		const board = initialFillEmptyBoard(shape, fillData);
		const solution = runSolverToFindSolution(board, solverTimeout);

		if (solution) return solution;
	}
	console.warn(`Failed to generate a solution board after ${maxAttempts} attempts, with a max time of ${solverTimeout}ms per attempt.`);
	return null;
}

/**
 * Calculates the maximum solver duration based on the puzzle dimensions, empirically determined.
 * @returns The maximum solver duration in milliseconds, between 100 and 1000.
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
};

function getInitialLinesToFill(initialFillType: LineType,
	dims: BoardShape): LineId[] {
	// If initialFillType is ROW, entire rows are assigned. The number of rows is numLines.
	// Then, get "getLineId" would be yToRowId.
	let getLineId: (i: number) => LineId;
	let numLines: number;

	if (initialFillType === ROW) {
		getLineId = yToRowId;
		numLines = dims.height;
	} else {
		getLineId = xToColumnId;
		numLines = dims.width;
	}

	// Select lines to fill randomly from all possible lines of the size
	// There should be 2 empty lines between all initially-filled lines for consistent, and valid, results
	const linesToFill: LineId[] = [];
	for (let i = 1; i < numLines - 2; i += 3) {
		linesToFill.push(getLineId(i));
	}
	return linesToFill;
}

/**
 * Determines the initial fill data based on the puzzle dimensions.
 * 
 * Either rows or columns will initially be filled, depending on which is smaller.
 * Starting with smaller is better than starting with larger, as tested:
 * The average time to generate many boards was about 20% faster with this approach.
 */
function getInitialFillData(width: number, height: number): InitialFillData {
	const initialFillSize = Math.min(width, height);
	const initialFillType = width === initialFillSize ? ROW : COLUMN;
	const possibleLines = getValidLinesOfSize(initialFillSize);

	const linesToFill = getInitialLinesToFill(initialFillType, { width, height });

	return { possibleLines, linesToFill };
}

/* if (import.meta.env.DEV) {
		if (!board.isValid()) {
			// 24-4-2024: Never had this problem, but let's keep this check in dev mode just in case something changes somewhere else
			throw new Error('Board is not valid after the initial fill during board/solution generation???');
		}
	} */

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
 *  Can use any constraint, and dfs, but should be optimized for speed.
 */
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