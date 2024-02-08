import type { SimpleBoard } from "@/lib/index.js";
import type { ConstraintSolverConstraintsCollection, ConstraintSolverResult } from "./types.js";
import { applyConstraintFnsWhileChangesFound } from "./helpers.js";
import { applyTriplesConstraint } from "./constraints/TriplesConstraint.js";
import { applyLineBalanceConstraint } from "./constraints/LineBalanceConstraint.js";
import { applyEliminationConstraint } from "./constraints/EliminationConstraint.js";

type ConstraintSolverStatus = 'running' | 'finished' | 'error' | 'idle';
export type ConstraintSolverConfParam = {
	constraints?: ConstraintSolverConstraintsCollection,
}

const getDefaultConstraintFns = (): ConstraintSolverConstraintsCollection => {
	return [
		applyTriplesConstraint,
		applyLineBalanceConstraint,
		applyEliminationConstraint
	]
}

export class ConstraintSolver {
	private readonly constraints: ConstraintSolverConstraintsCollection;
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
			constraints = getDefaultConstraintFns()
		} = conf;

		this.constraints = constraints;
		this.initialBoard = board.copy();
	}

	static run(board: SimpleBoard, conf?: ConstraintSolverConfParam): ConstraintSolverResult {
		const solver = new ConstraintSolver(board, conf ?? {});
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

	start() {
		if (this.isDone || this.isRunning) {
			console.error(`Should not start ConstraintSolver when status is "${this.status}"!`);
			return;
		}

		this.status = 'running';

		const board = this.initialBoard.copy();
		const constraintRes = this.solveWithConstraints(board);
		if (constraintRes.error != null) {
			// TODO: set error reason
			// can not be solved due to some error; probably invalid initial board or otherwise unsolvable board
			this.setErrorStatus(constraintRes.error);
			return;
		}

		if (board.isSolved()) {
			this.solutionsFound.push(board);
			this.status = 'finished';
			return;
		}

		// can not find solution (at least with just these constraint fns)
		this.status = 'finished';
		return;
	}

	private solveWithConstraints(board: SimpleBoard) {
		const result = applyConstraintFnsWhileChangesFound(board, this.constraints);
		return result;
	}
}