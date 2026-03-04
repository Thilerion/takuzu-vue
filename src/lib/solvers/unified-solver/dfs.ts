import type { SimpleBoard } from "@/lib/board/Board.js";
import { getOppositeSymbol } from "@/lib/utils/puzzle-value.utils.js";
import type { TimeoutChecker } from "./timeout.js";
import { runConstraintsUntilStable } from "./constraints-loop.js";
import type { ConstraintStrategy, SolverSelectCellFn, SolverSelectValueFn } from "./types.js";

export type DfsRunConfig = {
	strategies: ReadonlyArray<ConstraintStrategy>;
	selectCell: SolverSelectCellFn;
	selectValue: SolverSelectValueFn;
	maxSolutions: number;
	timeoutChecker: TimeoutChecker | null;
	maxDepth: number | null;
};

export type DfsResult = {
	outcome: 'finished';
	solutions: SimpleBoard[];
} | {
	outcome: 'max_solutions';
	solutions: SimpleBoard[];
} | {
	outcome: 'timed_out';
	solutions: SimpleBoard[];
} | {
	outcome: 'error';
	error: Error;
	solutions: SimpleBoard[];
};

function normalizeUnknownError(error: unknown): Error {
	if (error instanceof Error) return error;
	return new Error(String(error));
}

export function runDfs(
	initialBoard: SimpleBoard,
	config: DfsRunConfig,
): DfsResult {
	const {
		strategies,
		selectCell,
		selectValue,
		maxSolutions,
		timeoutChecker,
		maxDepth,
	} = config;

	const solutions: SimpleBoard[] = [];
	let timedOut = false;
	let reachedMaxSolutions = false;

	const visit = (board: SimpleBoard, depth: number): void => {
		if (timedOut || reachedMaxSolutions) return;

		if (timeoutChecker?.isTimedOut()) {
			timedOut = true;
			return;
		}

		if (maxDepth != null && depth > maxDepth) {
			return;
		}

		const loopResult = runConstraintsUntilStable(board, strategies);
		if (loopResult.outcome === 'invalid') return;
		if (loopResult.outcome === 'error') throw loopResult.error;

		if (!board.isValid()) return;
		if (board.isFilled()) {
			solutions.push(board.copy());
			if (solutions.length >= maxSolutions) {
				reachedMaxSolutions = true;
			}
			return;
		}

		const cell = selectCell(board);
		if (cell == null) {
			return;
		}

		const { x, y } = cell;
		const firstValue = selectValue(board, x, y);
		const secondValue = getOppositeSymbol(firstValue);

		const boardA = board.copy().assign(x, y, firstValue);
		visit(boardA, depth + 1);

		if (timedOut || reachedMaxSolutions) return;

		const boardB = board.copy().assign(x, y, secondValue);
		visit(boardB, depth + 1);
	};

	try {
		visit(initialBoard.copy(), 0);
	} catch (error) {
		return {
			outcome: 'error',
			error: normalizeUnknownError(error),
			solutions,
		};
	}

	if (timedOut) {
		return {
			outcome: 'timed_out',
			solutions,
		};
	}
	if (reachedMaxSolutions) {
		return {
			outcome: 'max_solutions',
			solutions,
		};
	}
	return {
		outcome: 'finished',
		solutions,
	};
}
