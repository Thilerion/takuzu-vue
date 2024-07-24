import type { SimpleBoard } from "@/lib/board/Board.js";
import type { ConstraintsHandler } from "./ConstraintsHandler.js";
import type { DFSHandler } from "./DFSHandler.js";
import type { SolverResult } from "./SolverResult.js";
import * as solverResult from "./SolverResult.js";

type SolverStatus = 'idle' | 'running' | 'finished';

export class PuzzleSolver {
	private constraintsHandler: ConstraintsHandler;
	private dfsHandler: DFSHandler | null;

	private solverStatus: SolverStatus = 'idle';
	/** Object with start and end time, in ms, to compute duration spent solving. */
	private timeMarks: {
		start: number | null,
		end: number | null,
	} = { start: null, end: null };

	private solutions: SimpleBoard[] = [];
	private result: Readonly<SolverResult> | null = null;


	constructor(
		constraintsHandler: ConstraintsHandler,
		dfsHandler: DFSHandler | null
	) {
		this.constraintsHandler = constraintsHandler;
		this.dfsHandler = dfsHandler;
	}

	solve(initialBoard: SimpleBoard): SolverResult {
		const board = initialBoard.copy();

		if (this.isFinished() || this.isRunning()) {
			throw new Error('Cannot start a new solver after it has already finished or is already running.');
		}
		this.setRunningStatus();

		this.runInitialCheck(board);
		if (this.isFinished()) return this.getResult();

		try {
			this.runConstraintsApplication(board);
		} catch(e) {
			console.warn('An unknown error occurred while running constraints application in Solver:', String(e));
			// error/exception, unknown error thrown while applying constraints
			const err = e instanceof Error ? e : new Error(String(e));
			this.setFinishedStatusWithResult(
				solverResult.fromError(
					{ method: 'constraints', duration: this.getRunDuration() },
					err,
					{
						description: 'From Solver.runConstraintsApplication() => unknown error caught',
						isException: true
					}
				)
			)
			return this.getResult();
		}

		if (this.isFinished()) return this.getResult();

		if (this.dfsHandler == null) {
			// partially solved; unsolvable without DFS, single partial solution found
			this.setFinishedStatusWithResult(
				solverResult.unsolvablePartial(
					{ method: 'constraints', duration: this.getRunDuration() },
					board.export()
				)
			)
			return this.getResult();
		}

		try {
			const boardPreDfs = board.copy();
			this.runDFS(boardPreDfs);
		} catch(e) {
			console.warn('An unknown error occurred while running DFS in Solver:', String(e));
			// error/exception, unknown error thrown while running DFS
			const err = e instanceof Error ? e : new Error(String(e));
			this.setFinishedStatusWithResult(
				solverResult.fromError(
					{ method: 'dfs', duration: this.getRunDuration() },
					err,
					{
						description: 'From Solver.runDFS() => unknown error caught',
						isException: true
					}
				)
			)
			return this.getResult();
		}

		if (!this.isFinished() || this.result == null) {
			throw new Error('Solver.solve() reached end, but result is null or status is not finished. This should not be possible.');
		}

		return this.getResult();
	}
	getResult(): SolverResult {
		if (!this.isFinished() || this.result == null) {
			throw new Error('Cannot get result from Solver, because it is not finished yet.');
		}
		return this.result!;
	}

	private runInitialCheck(board: SimpleBoard): void {
		const isValid = board.isValid();
		if (!isValid) {
			// unsolvable, invalid input board
			this.setFinishedStatusWithResult(
				solverResult.unsolvableInvalid(
					{ method: 'initial', duration: this.getRunDuration() },
					'Invalid input board'
				)
			)
			return;
		}
		const isSolved = isValid && board.isFilled();
		if (isSolved) {
			// solved, single exhaustive solution
			this.setFinishedStatusWithResult(
				solverResult.exhaustivelySolved(
					{ method: 'initial', duration: this.getRunDuration() },
					[board.export()]
				)
			)
			return;
		}
	}

	private runConstraintsApplication(board: SimpleBoard): void {
		const constraintResult = this.constraintsHandler.applyConstraints(board);
		if (constraintResult.error) {
			// TODO: check if specific error (invalid line/board) or unknown error. For now, handle as unsolvable invalid board
			this.setFinishedStatusWithResult(
				solverResult.unsolvableInvalid(
					{ method: 'constraints', duration: this.getRunDuration() },
					'Invalid board after constraints application. Original error property: ' + constraintResult.error
				)
			)
			return;
		}
		const isValid = board.isValid();
		if (!isValid && !constraintResult.changed) {
			// unsolvable, invalid input board
			this.setFinishedStatusWithResult(
				solverResult.unsolvableInvalid(
					{ method: 'constraints', duration: this.getRunDuration() },
					'Invalid input board'
				)
			)
			return;
		} else if (!isValid && constraintResult.changed) {
			// unsolvable, invalid board after constraints application
			this.setFinishedStatusWithResult(
				solverResult.unsolvableInvalid(
					{ method: 'constraints', duration: this.getRunDuration() },
					'Invalid board after constraints application'
				)
			)
			return;
		}

		const isSolved = isValid && board.isFilled();
		if (isSolved) {
			// solved, single exhaustive solution
			this.setFinishedStatusWithResult(
				solverResult.exhaustivelySolved(
					{ method: 'constraints', duration: this.getRunDuration() },
					[board.export()]
				)
			)
			return;
		}

		// Not solved, still valid, after constraints application. Run DFS if enabled.
		return;
	}

	private runDFS(board: SimpleBoard): void {
		if (this.dfsHandler == null) {
			throw new Error('Cannot run DFS without a DFSHandler.');
		}

		const dfsResult = this.dfsHandler!.performDFS(board, {
            onSolutionFound: (solution) => {
                this.solutions.push(solution);
            }
        });

		if (dfsResult.status === 'error') {
			const { message: dfsErrorMessage } = dfsResult;
			// unsolvable, caught DFS error (unknown error) TODO: which errors can be received here?
			this.setFinishedStatusWithResult(
				solverResult.fromError(
					{ method: 'dfs', duration: this.getRunDuration() },
					dfsErrorMessage,
					{
						description: 'From DFSHandler.runDFS() => dfsResult error status',
						isException: false
					}
				)
			)
			return;
		}

		const { reason, solutionsFound } = dfsResult;
		switch (reason) {
			case 'max_solutions_reached': {
				if (solutionsFound === 0) {
					// This should never happen, as maxSolution may not be set to 0
					throw new Error('Max solutions was reached, but no solutions were found in DFS. This should never happen!');
				} else if (solutionsFound >= 0) {
					// max solutions reached, single/multiple non-exhaustive solution(s) found
					this.setFinishedStatusWithResult(
						solverResult.incomplete(
							{ method: 'dfs', duration: this.getRunDuration() },
							this.solutions.map(s => s.export())
						)
					)
					return;
				} else {
					const registeredSolutions = this.solutions.length;
					// MaxSolutions was reached, but solutionsFound has an invalid value
					console.warn(`[Solver] Max solutions was reached, but solutionsFound has an invalid value`, {
						numSolutionsFromDFS: solutionsFound,
						numSolutionsRegistered: registeredSolutions,
					});
					throw new Error('[Solver] Max solutions was reached, but solutionsFound has an invalid value');
				}
			}
			case 'timed_out': {
				// unsolvable, timed out, no/one/multiple (non-exhaustive) solution(s) found
				this.setFinishedStatusWithResult(
					solverResult.incomplete(
						{ method: 'dfs', duration: this.getRunDuration() },
						this.solutions.map(s => s.export())
					),
				)
				return;
			}
			case 'finished': {
				if (solutionsFound === 0) {
					// unsolvable, no solutions found, exhaustive; DFS would have found a solution if there were any
					this.setFinishedStatusWithResult(
						solverResult.unsolvableExhaustive({
							method: 'dfs',
							duration: this.getRunDuration()
						})
					)
					return;
				} else if (solutionsFound === 1) {
					// solved, single exhaustive solution found
					this.setFinishedStatusWithResult(
						solverResult.exhaustivelySolved(
							{ method: 'dfs', duration: this.getRunDuration() },
							[...this.solutions].map(s => s.export()
						))
					)
					return;
				} else {
					// solved, multiple exhaustive solutions found
					this.setFinishedStatusWithResult(
						solverResult.exhaustivelySolved(
							{ method: 'dfs', duration: this.getRunDuration() },
							this.solutions.map(s => s.export()
						))
					)
					return;
				}
			}
			default: {
				const x: never = reason;
				throw new Error(`Unexpected reason in runDFS(): ${x}`);
			}
		}
	}


	////////////////////////////////////////////////
	// Get/set solver status/results
	////////////////////////////////////////////////
	isFinished() {
		return this.solverStatus === 'finished';
	}
	isRunning() {
		return this.solverStatus === 'running';
	}

	private setRunningStatus() {
		if (this.solverStatus !== 'idle') {
			throw new Error(`Cannot set running status in Solver, because it is not idle. Current status is "${this.solverStatus}".`);
		}
		this.solverStatus = 'running';
		this.timeMarks.start = performance.now();
	}

	private getRunDuration(): number {
		if (this.timeMarks.start == null || this.solverStatus === 'idle') {
			throw new Error('Cannot get run duration in Solver, because it is not running/start time is not set.');
		}
		if (this.timeMarks.end == null) {
			// End time might not be set yet, if the runDuration is retrieved before the solver has set its finished status (when creating a result object)
			this.timeMarks.end = performance.now();
		}
		return this.timeMarks.end - this.timeMarks.start;
	}

	private setFinishedStatusWithResult(result: SolverResult): SolverResult {
		if (!this.isRunning()) {
			throw new Error(`Cannot set finished status in Solver, because it is not running. Current status is "${this.solverStatus}".`);
		} else if (this.result != null) {
			throw new Error(`Cannot set finished status in Solver, because it already has a result. Current result is "${this.result}".`);
		}

		this.solverStatus = 'finished';
		this.timeMarks.end ??= performance.now();

		this.result = result;
		return result;
	}
}