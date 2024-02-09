import type { SimpleBoard } from "@/lib/index.js";
import type { ConstraintSolverConstraintsCollection, ConstraintSolverResult, SolverSelectCellFn, SolverSelectValueFn } from "./types.js";
import { applyConstraintFnsWhileChangesFound } from "./helpers.js";
import { applyTriplesConstraint } from "./constraints/TriplesConstraint.js";
import { applyLineBalanceConstraint } from "./constraints/LineBalanceConstraint.js";
import { applyEliminationConstraint } from "./constraints/EliminationConstraint.js";
import type { ConstraintResult } from "./constraints/types.js";
import { OPPOSITE_SYMBOL_MAP, type PuzzleSymbol } from "@/lib/constants.js";
import type { DeepReadonly } from "vue";

type ConstraintSolverStatus = 'running' | 'finished' | 'idle';
export type ConstraintSolverBaseConf = {
	constraints: ConstraintSolverConstraintsCollection,
}
export type ConstraintSolverDfsConf = {
	enabled: false,
	selectCell?: SolverSelectCellFn,
	selectValue?: SolverSelectValueFn,
	timeout?: number | null,
	throwAfterTimeout?: boolean,
} | {
	enabled: true,
	selectCell: SolverSelectCellFn, // TODO: also allow name of strategies
	selectValue: SolverSelectValueFn,
	timeout: number | null,
	throwAfterTimeout?: boolean,
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
	// TODO: private result, which is what the run() function returns, and what getResults() returns

	private readonly solutionsFound: SimpleBoard[] = [];

	// timeout state
	private startTime: number | null = null;
	private endTime: number | null = null;

	private constructor(
		board: SimpleBoard,
		conf: ConstraintSolverConfParam
	) {
		const { 
			constraints = getDefaultConstraintFns(),
			dfs: dfsOpts = { enabled: false, timeout: null, throwAfterTimeout: false },
			maxSolutions
		} = conf;

		this.dfsOpts = { ...dfsOpts };
		this.maxSolutions = maxSolutions;
		this.constraints = constraints;
		this.initialBoard = board.copy();
	}

	static run(board: SimpleBoard, conf?: ConstraintSolverConfParam): ConstraintSolverResult {
		const solver = new ConstraintSolver(board, conf ?? {
			maxSolutions: 1,
		});
		solver.start();

		if (solver.isFinished) {
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
	get isRunning() {
		return this.status === 'running';
	}
	get hasFoundSolutions() {
		return this.solutionsFound.length > 0;
	}
	private setFinishedStatus() {
		this.status = 'finished';
	}
	private get timeoutEnabled() {
		return this.dfsOpts.enabled && this.dfsOpts.timeout != null;
	}
	private checkTimeoutReached() {
		if (!this.timeoutEnabled) return false;
		if (performance.now() >= this.endTime!) {
			this.setFinishedStatus();
			if (this.dfsOpts.throwAfterTimeout) {
				throw new Error('Stopped ConstraintSolver due to timeout.');
			}
			console.warn('Stopped ConstraintSolver due to timeout.');
			return true;
		}
		return false;
	}

	start() {
		if (this.isFinished || this.isRunning) {
			console.error(`Should not start ConstraintSolver when status is "${this.status}"!`);
			return;
		}

		this.status = 'running';
		if (this.timeoutEnabled) {
			this.startTime = performance.now();
			this.endTime = this.startTime + this.dfsOpts.timeout!;
		}

		const board = this.initialBoard.copy();
		const constraintRes = this.solveWithConstraints(board);

		if (constraintRes.error != null) {
			// can not be solved due to some error; probably invalid initial board or otherwise unsolvable board
			this.setFinishedStatus();
			return;
		}

		const boardStatus = this.getBoardStatus(board);
		if (boardStatus === 'solved') {
			this.solutionsFound.push(board);
			this.setFinishedStatus();
			return;
		} else if (boardStatus === 'invalid') {
			this.setFinishedStatus();
			return;
		}

		// start dfs if enabled, beacuse no solution found yet
		if (this.dfsOpts.enabled) {
			this.dfs(board);
			if (this.isFinished) return;
			this.setFinishedStatus();
			return;
		} else {
			// otherwise, can not find solution (at least with just these constraint fns)
			this.setFinishedStatus();
			return;
		}		
	}

	private dfs(board: SimpleBoard): void {
		// cases where dfs should stop;
		if (this.isFinished) return;
		else if (this.solutionsFound.length >= this.maxSolutions) {
			this.setFinishedStatus();
			return;
		}
		// cases where this particular path should stop
		const boardStatus = this.getBoardStatus(board);
		if (boardStatus === 'invalid') return;
		else if (boardStatus === 'solved') {
			this.solutionsFound.push(board);
			return;
		}

		// another case where dfs should stop, but placed after possibly adding the current solution (would be wasteful otherwise)
		if (this.checkTimeoutReached()) {
			return;
		}

		const cell = this.dfsOpts.selectCell!(board);
		if (cell == null) {
			// no cell found; this path is invalid
			return;
		}
		const { x, y } = cell;
		const initialValue = this.dfsOpts.selectValue!(board, x, y);
		const resultBoardA = this.dfsGetNextState(board, x, y, initialValue);
		if (resultBoardA) {
			this.dfs(resultBoardA);
		}

		const otherValue = OPPOSITE_SYMBOL_MAP[initialValue];
		const resultBoardB = this.dfsGetNextState(board, x, y, otherValue);
		if (resultBoardB) {
			this.dfs(resultBoardB);
		}
		return;
	}

	/** Returns the board if should continue search with this board, else returns false if should break from this path. */
	private dfsGetNextState(
		board: DeepReadonly<SimpleBoard>,
		x: number,
		y: number,
		value: PuzzleSymbol
	): SimpleBoard | false {
		const boardCopy = board.copy();
		const result = this.solveWithConstraints(boardCopy.assign(x, y, value));
		if (result.error != null) {
			return false; // invalid board, do not continue searching in this path
		}
		return boardCopy;
	}

	private solveWithConstraints(board: SimpleBoard): ConstraintResult {
		const result = applyConstraintFnsWhileChangesFound(board, this.constraints);
		return result;
	}

	private getBoardStatus(board: SimpleBoard): 'invalid' | 'solved' | 'unsolved' {
		if (!board.isValid()) return 'invalid';
		
		// board is valid, and if also filled, then it is solved
		if (board.isFilled()) return 'solved';
		return 'unsolved';
	}
}