import type { SimpleBoard } from "@/lib/board/Board.js";
import { ConstraintsHandler, type ConstraintsHandlerConfig } from "./helpers/ConstraintsHandler.js";
import { DFSHandler, type DFSHandlerConfig } from "./helpers/DFSHandler.js";
import type { SolverMethod, SolverResult } from "./helpers/SolverResult.js";
import { createResult } from "./helpers/SolverResult.js";

type SolverStatus = 'idle' | 'running' | 'finished';

export interface LogicSolverConfig {
	// TODO: add throwOnErrorResult option, to let the solver throw if there is an (unexpected/unknown) error
	throwOnErrorResult?: boolean
}

export class LogicSolver {
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
		dfsHandler: DFSHandler | null,
		config: LogicSolverConfig
	) {
		this.constraintsHandler = constraintsHandler;
		this.dfsHandler = dfsHandler;
		if (config.throwOnErrorResult != null) {
			throw new Error('throwOnErrorResult option is not yet implemented.');
		}
	}

	////////////////////////////////////////////////
	// Static class instantiation methods
	////////////////////////////////////////////////

	static create(
		constraintsHandlerOrConfig: ConstraintsHandler | ConstraintsHandlerConfig,
		dfsHandlerOrConfig: DFSHandler | DFSHandlerConfig | null | undefined,
		logicSolverConfig: LogicSolverConfig,
	): LogicSolver {
		const constraintsHandler = (constraintsHandlerOrConfig instanceof ConstraintsHandler)
			? constraintsHandlerOrConfig
			: ConstraintsHandler.fromConfig(constraintsHandlerOrConfig);

		let dfsHandler: DFSHandler | null;
		if (dfsHandlerOrConfig == null) {
			// DFS is disabled
			dfsHandler = null;
		} else if (dfsHandlerOrConfig instanceof DFSHandler) {
			dfsHandler = dfsHandlerOrConfig;
		} else {
			dfsHandler = DFSHandler.fromConfig(dfsHandlerOrConfig, constraintsHandler);
		}

		return new LogicSolver(constraintsHandler, dfsHandler, logicSolverConfig);
	}

	////////////////////////////////////////////////
	// Core functionality
	////////////////////////////////////////////////

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
			this.setFinishedStatusWithResult(
				createResult.fromError(
					{ method: 'constraints', duration: this.getRunDuration() },
					e instanceof Error ? e : new Error(String(e)),
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
				createResult.unsolvablePartial(
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
			this.setFinishedStatusWithResult(
				createResult.fromError(
					{ method: 'dfs', duration: this.getRunDuration() },
					e instanceof Error ? e : new Error(String(e)),
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
		const status = this.getBoardStatus(board);
		switch(status) {
			case 'solved': {
				// solved, single exhaustive solution
				this.setFinishedStatusWithResult(
					createResult.exhaustivelySolved(
						{ method: 'initial', duration: this.getRunDuration() },
						[board.export()]
					)
				)
				return;
			}
			case 'invalid': {
				// unsolvable, invalid input board
				this.setUnsolvableInvalidResult('initial', 'Invalid input board');
				return;
			}
		}
	}

	private runConstraintsApplication(board: SimpleBoard): void {
		const constraintResult = this.constraintsHandler.applyConstraints(board);
		if (constraintResult.error) {
			// TODO: check if specific error (invalid line/board) or unknown error. For now, handle as unsolvable invalid board
			return this.setUnsolvableInvalidResult(
				'constraints',
				'Invalid board after constraints application. Original error property: ' + constraintResult.error
			);
		}

		const status = this.getBoardStatus(board);

		if (status === 'invalid' && !constraintResult.changed) {
			// unsolvable, invalid input board
			return this.setUnsolvableInvalidResult('constraints', 'Invalid input board');
		} else if (status === 'invalid' && constraintResult.changed) {
			// unsolvable, invalid board after constraints application
			return this.setUnsolvableInvalidResult('constraints', 'Invalid board after constraints application');
		}

		if (status === 'solved') {
			// solved, single exhaustive solution
			this.setFinishedStatusWithResult(
				createResult.exhaustivelySolved(
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
				createResult.fromError(
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
		const solutionsRegistered = this.solutions.length;
		if (solutionsFound !== solutionsRegistered) {
			throw new Error(`[Solver] DFS found ${solutionsFound} solutions, but only ${solutionsRegistered} solutions were registered.`);
		}

		switch (reason) {
			case 'max_solutions_reached': {
				// max solutions reached, single/multiple non-exhaustive solution(s) found
				this.setFinishedStatusWithResult(
					createResult.incomplete(
						{ method: 'dfs', duration: this.getRunDuration() },
						{ reason: 'max_solutions', maxSolutions: this.getMaxSolutionsSetting()! },
						this.solutions.map(s => s.export())
					)
				)
				return;
			}
			case 'timed_out': {
				// unsolvable, timed out, no/one/multiple (non-exhaustive) solution(s) found
				this.setFinishedStatusWithResult(
					createResult.incomplete(
						{ method: 'dfs', duration: this.getRunDuration() },
						{ reason: 'timed_out', timeout: this.getTimeoutSetting()! },
						this.solutions.map(s => s.export())
					),
				)
				return;
			}
			case 'finished': {
				if (solutionsFound === 0) {
					// unsolvable, no solutions found, exhaustive; DFS would have found a solution if there were any
					this.setFinishedStatusWithResult(
						createResult.unsolvableExhaustive({
							method: 'dfs',
							duration: this.getRunDuration(),
						})
					)
					return;
				}
				// solved, single/multiple exhaustive solution(s) found
				this.setFinishedStatusWithResult(
					createResult.exhaustivelySolved(
						{ method: 'dfs', duration: this.getRunDuration() },
						this.solutions.map(s => s.export()
					))
				)
				return;
			}
			default: {
				const x: never = reason;
				throw new Error(`Unexpected reason in runDFS(): ${x}`);
			}
		}
	}

	private getBoardStatus(board: SimpleBoard): 'solved' | 'invalid' | 'unsolved' {
		// TODO: check if this lastStatusResult check is faster than simply running the checkStatus functions
		const isValid = board.isValid();
		if (!isValid) return 'invalid';
		const isSolved = isValid && board.isFilled();
		return isSolved ? 'solved' : 'unsolved';
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

	private setUnsolvableInvalidResult(
		method: SolverMethod,
		message?: string
	): void {
		this.setFinishedStatusWithResult(
			createResult.unsolvableInvalid(
				{ method, duration: this.getRunDuration() },
				message ?? `Invalid board during "${method}"`
			)
		)
    }

	private getMaxSolutionsSetting(): number | null {
		if (this.dfsHandler == null) return null;
		return this.dfsHandler.maxSolutions;
	}
	private getTimeoutSetting(): number | null {
		if (this.dfsHandler == null) return null;
		return this.dfsHandler.timeoutChecker?.timeoutMs ?? null;
	}
}