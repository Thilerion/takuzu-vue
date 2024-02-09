import type { SimpleBoard } from "@/lib/index.js";
import type { ConstraintSolverConstraintsCollection, ConstraintSolverResult, SolverSelectCellFn, SolverSelectValueFn } from "./types.js";
import { applyConstraintFnsWhileChangesFound } from "./helpers.js";
import { applyTriplesConstraint } from "./constraints/TriplesConstraint.js";
import { applyLineBalanceConstraint } from "./constraints/LineBalanceConstraint.js";
import { applyEliminationConstraint } from "./constraints/EliminationConstraint.js";
import type { ConstraintResult } from "./constraints/types.js";
import { OPPOSITE_SYMBOL_MAP, type PuzzleSymbol } from "@/lib/constants.js";

type ConstraintSolverStatus = 'running' | 'finished' | 'error' | 'idle';
export type ConstraintSolverBaseConf = {
	constraints: ConstraintSolverConstraintsCollection,
}
export type ConstraintSolverDfsConf = {
	enabled: false,
	selectCell?: SolverSelectCellFn,
	selectValue?: SolverSelectValueFn,
} | {
	enabled: true,
	selectCell: SolverSelectCellFn, // TODO: also allow name of strategies
	selectValue: SolverSelectValueFn,
}
export type ConstraintSolverConfParam = {
	constraints?: ConstraintSolverConstraintsCollection,
	dfs?: ConstraintSolverDfsConf,
	maxSolutions: number,
}

const getDefaultConstraintFns = (): ConstraintSolverConstraintsCollection => {
	return [
		applyTriplesConstraint,
		applyLineBalanceConstraint,
		applyEliminationConstraint, // TODO: what are the default min/max least remaining values and other opts?
	]
}

export class ConstraintSolver {
	private readonly constraints: ConstraintSolverConstraintsCollection;
	readonly dfsOpts: ConstraintSolverDfsConf;
	readonly maxSolutions: number;
	private readonly initialBoard: SimpleBoard;

	private status: ConstraintSolverStatus = 'idle';
	private errorReason: string | null = null;
	// TODO: private result, which is what the run() function returns, and what getResults() returns

	private readonly solutionsFound: SimpleBoard[] = [];

	private constructor(
		board: SimpleBoard,
		conf: ConstraintSolverConfParam
	) {
		const { 
			constraints = getDefaultConstraintFns(),
			dfs: dfsOpts = { enabled: false },
			maxSolutions
		} = conf;

		this.dfsOpts = dfsOpts;
		this.maxSolutions = maxSolutions;
		this.constraints = constraints;
		this.initialBoard = board.copy();
	}

	static run(board: SimpleBoard, conf?: ConstraintSolverConfParam): ConstraintSolverResult {
		const solver = new ConstraintSolver(board, conf ?? {
			maxSolutions: 1,
		});
		solver.start();

		if (solver.status === 'error') {
			return {
				solvable: false,
				numSolutions: 0,
				solutions: [],
				error: solver.errorReason!,
			}
		} else if (solver.isDone) {
			if (solver.hasFoundSolutions) {
				return {
					solvable: true,
					numSolutions: solver.solutionsFound.length,
					solutions: solver.solutionsFound,
				}
			} else {
				return {
					solvable: false,
					numSolutions: 0,
					solutions: [],
				}
			}
		} else {
			// should not happen, status here is "idle" or "running" which is strange
			throw new Error(`Unexpected status after Solver.run(); status is "${solver.status}" while it could only be error or finished.`);
		}
	}

	get isFinished() {
		return this.status === 'finished';
	}
	get isDone() {
		return this.status === 'finished' || this.status === 'error';
	}
	get isRunning() {
		return this.status === 'running';
	}
	get hasFoundSolutions() {
		return this.solutionsFound.length > 0;
	}
	private setErrorStatus(reason: string) {
		this.status = 'error';
		this.errorReason = reason;
	}
	private setFinishedStatus() {
		this.status = 'finished';
	}

	start() {
		if (this.isDone || this.isRunning) {
			console.error(`Should not start ConstraintSolver when status is "${this.status}"!`);
			return;
		}

		this.status = 'running';

		const board = this.initialBoard.copy();
		const constraintRes = this.solveWithConstraints(board);

		if (constraintRes.error != null) {
			// can not be solved due to some error; probably invalid initial board or otherwise unsolvable board
			this.setErrorStatus(constraintRes.error);
			return;
		}

		if (board.isSolved()) {
			this.solutionsFound.push(board);
			this.setFinishedStatus();
			return;
		}

		// start dfs if enabled, beacuse no solution found yet
		if (this.dfsOpts.enabled) {
			this.dfs(board);
			if (this.isDone) return;
			this.setFinishedStatus();
			return;
		} else {
			// otherwise, can not find solution (at least with just these constraint fns)
			this.setFinishedStatus();
			return;
		}		
	}

	private dfs(board: SimpleBoard): void {
		// cases where dfs should stop; TODO: timeout reached
		if (this.isDone) return;
		if (this.solutionsFound.length >= this.maxSolutions) {
			this.setFinishedStatus();
			return;
		}
		// cases where this particular path should stop
		if (!board.isValid()) return;
		if (board.isFilled()) {
			this.solutionsFound.push(board);
			return;
		}

		const cell = this.dfsOpts.selectCell!(board);
		if (cell == null) {
			// no cell found; this path is invalid
			return;
		}
		const { x, y } = cell;
		const initialValue = this.dfsOpts.selectValue!(board, x, y);
		const resultBoardA = this.dfsAssignAndSolveWithConstraints(board.copy(), x, y, initialValue);
		if (resultBoardA) {
			this.dfs(resultBoardA);
		}

		const otherValue = OPPOSITE_SYMBOL_MAP[initialValue];
		const resultBoardB = this.dfsAssignAndSolveWithConstraints(board.copy(), x, y, otherValue);
		if (resultBoardB) {
			this.dfs(resultBoardB);
		}
		return;
	}

	/** Returns the board if should continue search with this board, else returns false if should break from this path. */
	private dfsAssignAndSolveWithConstraints(
		board: SimpleBoard,
		x: number,
		y: number,
		value: PuzzleSymbol
	): SimpleBoard | false {
		const result = this.solveWithConstraints(board.assign(x, y, value));
		if (result.error != null) {
			return false; // invalid board, do not continue searching in this path
		}
		return board;
	}

	private solveWithConstraints(board: SimpleBoard): ConstraintResult {
		const result = applyConstraintFnsWhileChangesFound(board, this.constraints);
		return result;
	}
}