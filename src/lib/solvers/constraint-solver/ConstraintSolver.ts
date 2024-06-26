import type { SimpleBoard } from "@/lib/board/Board.js";
import type { ConstraintSolverConstraintsCollection, SolverSelectCellFn, SolverSelectValueFn } from "./types.js";
import { applyConstraintFnsWhileChangesFound } from "./helpers.js";
import { applyTriplesConstraintWithOpts } from "./constraints/TriplesConstraint.js";
import { applyLineBalanceConstraintWithOpts } from "./constraints/LineBalanceConstraint.js";
import { applyEliminationConstraintWithOpts } from "./constraints/EliminationConstraint.js";
import type { ConstraintResult } from "./constraints/types.js";
import type { PuzzleSymbol } from "@/lib/constants.js";
import type { DeepReadonly } from "vue";
import { selectCellStrategies, selectValueStrategies, type SelectCellStrategyName, type SelectValueStrategyName } from "./selection/index.js";
import { getOppositeSymbol } from "@/lib/utils/puzzle-value.utils.js";

const DEFAULT_TIMEOUT = 2000; // safety measure, can be overridden by user

type ConstraintSolverStatus = 'running' | 'finished' | 'idle';
export type ConstraintSolverResultSolvable = {
	solvable: true,
	numSolutions: number, // >= 1
	solutions: SimpleBoard[],
	partialPreDfsSolution: SimpleBoard | null,
}
export type ConstraintSolverResultUnsolvable = {
	solvable: false,
	numSolutions: 0,
	solutions: never[],
	finalBoard?: SimpleBoard, // at the moment the solver could not find any more solutions
}
export type ConstraintSolverResult = ConstraintSolverResultSolvable | ConstraintSolverResultUnsolvable;

export type ConstraintSolverDfsTimeoutOpts = {
	timeout: number | null,
	throwAfterTimeout: boolean,
}
export type ConstraintSolverDfsSelectionOpts = {
	selectCell: SolverSelectCellFn | SelectCellStrategyName,
	selectValue: SolverSelectValueFn | SelectValueStrategyName,
}
export type ConstraintSolverOpts = {
	constraints?: ConstraintSolverConstraintsCollection,
	maxSolutions: number,
	/** Dfs option defaults to { enabled: false } if not provided */
	dfs?: {
		enabled: boolean,
	} & Partial<ConstraintSolverDfsTimeoutOpts> & Partial<ConstraintSolverDfsSelectionOpts>
}
export type ConstraintSolverRunOpts = {
	/** Whether or not to return the instance of the solver. */
	returnInstance?: boolean,
}
type ConstraintSolverInternalDfsOpts = {
	enabled: false,
	selectCell?: null,
	selectValue?: null,
	timeout?: null,
	throwAfterTimeout?: false | null,
} | {
	enabled: true,
	selectCell: SolverSelectCellFn,
	selectValue: SolverSelectValueFn,
	timeout: number | null,
	throwAfterTimeout?: boolean,
}

type ConstraintSolverInternalCtorOpts = Omit<Required<ConstraintSolverOpts>, 'dfs'> & {
	dfs: ConstraintSolverInternalDfsOpts,
}

const getDefaultConstraintFns = (): ConstraintSolverConstraintsCollection => {
	return [
		applyTriplesConstraintWithOpts({ singleAction: false }),
		applyLineBalanceConstraintWithOpts({ singleAction: false }),
		applyEliminationConstraintWithOpts({ singleAction: true, leastRemainingRange: [1, 3], useDuplicateLines: true }), // TODO: debatable if useDuplicateLines should default to true
	]
}

export class ConstraintSolver {
	// options, and initialBoard
	readonly constraints: ConstraintSolverConstraintsCollection;
	readonly dfsOpts: Readonly<ConstraintSolverInternalDfsOpts>;
	readonly maxSolutions: number;
	readonly initialBoard: SimpleBoard;

	// current solver status, publicly accessible through getters
	private status: ConstraintSolverStatus = 'idle';

	// results and solutions found, publicly accessible through getResults()
	private _results: ConstraintSolverResult | null = null;
	private solutionsFound: SimpleBoard[] = [];
	/** The board after constraints were applied, but before DFS was run. All its values are definite values in those cells. If constraints resulted in a complete solution, or an invalid puzzle board, this will be null. */
	private partialPreDfsSolution: SimpleBoard | null = null;

	// timeout state
	private startTime: number | null = null;
	private endTime: number | null = null;

	constructor(
		board: SimpleBoard,
		conf: ConstraintSolverOpts
	) {
		const {
			constraints,
			maxSolutions,
			dfs: dfsOpts,
		} = this.mergeConfig(conf);

		this.constraints = constraints;
		this.maxSolutions = maxSolutions;
		this.dfsOpts = dfsOpts;

		// There can never be more than 1 solution if backtracking/DFS is not enabled.
		if (maxSolutions > 1 && !dfsOpts.enabled) {
			throw new Error('Using "maxSolutions > 1" requires DFS to be enabled!');
		}

		this.initialBoard = board.copy();
	}

	static run(board: SimpleBoard, conf: ConstraintSolverOpts): ConstraintSolverResult;
	static run(board: SimpleBoard, conf: ConstraintSolverOpts, runOpts: { returnInstance: true }): ConstraintSolverResult & { instance: ConstraintSolver };
	static run(board: SimpleBoard, conf: ConstraintSolverOpts, runOpts?: ConstraintSolverRunOpts): ConstraintSolverResult | (ConstraintSolverResult & { instance: ConstraintSolver });
	/** Simple run the solver, and returns the results. Requires a value for maxSolutions. */
	static run(board: SimpleBoard, conf: ConstraintSolverOpts, runOpts?: ConstraintSolverRunOpts): ConstraintSolverResult | (ConstraintSolverResult & { instance: ConstraintSolver}) {
		const solver = new ConstraintSolver(board, conf);
		solver.start();

		if (solver.isFinished) {
			if (runOpts?.returnInstance) {
				return {
					instance: solver,
					...solver.getResults(),
				}
			} else {
				return solver.getResults();
			}
		} else {
			// should not happen, status here is "idle" or "running" which is strange
			throw new Error(`Unexpected status after ConstraintSolver.run(); status is "${solver.status}" while it could only be error or finished.`);
		}
	}
	/**
	 * Runs the solver, checking if the input puzzle has one, single, unique solution.
	 * If DFS is enabled, this means that it checks that there *is* a solution, and that there are not too many.
	 * If DFS is disabled, it checks that there *is* a solution that can be found with the given constraints.
	 * Automatically sets the amount of solutions to search for.
	 */
	static hasSingleUniqueSolution(
		board: SimpleBoard,
		opts: Omit<ConstraintSolverOpts, 'maxSolutions'>
	): { success: true, solver: ConstraintSolver, solution: SimpleBoard } | { success: false, solver: ConstraintSolver } {
		const maxSolutions = opts.dfs?.enabled ? 2 : 1;
		const mergedOpts = {
			...opts,
			maxSolutions,
		}
		const solver = new ConstraintSolver(board, mergedOpts).start();
		const results = solver.getResults();

		if (results.numSolutions === 1) {
			return {
				solver,
				success: true,
				solution: results.solutions[0],
			}
		} else {
			return {
				solver,
				success: false,
			}
		}
	}

	static quickFindAnySolution(
		board: SimpleBoard,
		opts: {
			// default DFS options, without enabled as it is permanently enabled here
			dfs?: Omit<NonNullable<ConstraintSolverOpts['dfs']>, 'enabled'>,
		}
	) {
		/* Use the same constraints as "findAmountOfSolutions", which should hopefully be the fastest way to get a solution. */
		const mergedOpts: ConstraintSolverOpts = {
			constraints: [
				applyEliminationConstraintWithOpts({
					leastRemainingRange: [0, 10],
					singleAction: false,
					maxEmptyCells: Infinity
				}),
			],
			maxSolutions: 1,
			dfs: {
				enabled: true,
				...opts.dfs,
			}
		}
		return ConstraintSolver.run(board, mergedOpts);
	}

	/**
	 * Runs the solver using DFS and a static list of constraints, and returns the amount of solutions the puzzle has (by default up to 200 solutions).
	 * Allows for settings timeout options, and a maximum amount of solutions to search for.
	 * Prioritizes speed, without regard for the techniques used to get to a solution, so this is not suitable for generating puzzles/masks or checking difficulty.
	 * Useful when you just want to know how many solutions a puzzle has.
	 */
	static findAmountOfSolutions(
		board: SimpleBoard,
		opts: {
			// default DFS options, without enabled as it is permanently enabled here
			dfs?: Omit<NonNullable<ConstraintSolverOpts['dfs']>, 'enabled'>,
			// optionally set maxSolutions to search for, defaults to 200
			maxSolutions?: number,
		}
	): { numSolutions: number, solvable: boolean, instance: ConstraintSolver } {
		/*
			See ConstraintSolver.benchmark.ts for benchmarks for a combination of options.
			Using EliminationConstraint with DFS is, by far, the fastest way to find a large amount of solutions.
			TODO: maybe there is another, faster or better way, when the maskRatio is very low or very high, or when a board is very large.
		*/
		const mergedOpts: ConstraintSolverOpts = {
			constraints: [
				applyEliminationConstraintWithOpts({
					leastRemainingRange: [0, 10],
					singleAction: false,
					maxEmptyCells: Infinity
				}),
			],
			maxSolutions: opts.maxSolutions ?? 200,
			dfs: {
				enabled: true,
				...opts.dfs,
			}
		}
		const results = ConstraintSolver.run(board, mergedOpts, { returnInstance: true });
		const {
			numSolutions, solvable
		} = results;
		return { numSolutions, solvable, instance: results.instance };
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
	private handleTimeoutCheck() {
		if (!this.timeoutEnabled) return false;
		if (performance.now() >= this.endTime!) {
			// TODO: set reason in finishedStatus. If stopped due to timeout, things like the amount of found solutions is no longer valid
			this.setFinishedStatus();
			if (this.dfsOpts.throwAfterTimeout) {
				throw new Error('Stopped ConstraintSolver due to timeout.');
			}
			console.warn('Stopped ConstraintSolver due to timeout.');
			return true;
		}
		return false;
	}
	
	getResults(): ConstraintSolverResult {
		if (!this.isFinished) {
			throw new Error('ConstraintSolver has not finished yet');
		} else if (this._results == null) {
			if (this.hasFoundSolutions) {
				this._results = {
					solvable: true,
					numSolutions: this.solutionsFound.length,
					solutions: this.solutionsFound,
					partialPreDfsSolution: this.partialPreDfsSolution,
				}
			} else {
				this._results = {
					solvable: false,
					numSolutions: 0,
					solutions: [],
				}
			}
		}
		return { ...this._results };
	}

	private start(): this {
		if (this.isFinished || this.isRunning) {
			console.error(`Should not start ConstraintSolver when status is "${this.status}"!`);
			return this;
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
			return this;
		}

		const boardStatus = this.getBoardStatus(board);
		if (boardStatus === 'solved') {
			this.solutionsFound.push(board);
			this.setFinishedStatus();
			return this;
		} else if (boardStatus === 'invalid') {
			this.setFinishedStatus();
			return this;
		} else {
			// board is not yet completely solved, but perhaps partially solved
			// this might be useful if dfs is disabled or won't complete due to timeout
			this.partialPreDfsSolution = board.copy();
		}

		// start dfs if enabled, beacuse no solution found yet
		if (this.dfsOpts.enabled) {
			this.dfs(board);
			if (this.isFinished) return this;
			this.setFinishedStatus();
			return this;
		} else {
			// otherwise, can not find solution (at least with just these constraint fns)
			this.setFinishedStatus();
			return this;
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
		if (this.handleTimeoutCheck()) {
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

		const otherValue = getOppositeSymbol(initialValue);
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

	private mergeConfig(userConf: ConstraintSolverOpts): ConstraintSolverInternalCtorOpts {
		const dfs: ConstraintSolverInternalDfsOpts = (userConf.dfs == null || !userConf.dfs.enabled) ? {
			enabled: false
		} : {
			...userConf.dfs,
			...getSelectionFunctionsFromOpts(userConf.dfs),
			enabled: true,
			timeout: userConf.dfs.timeout ?? DEFAULT_TIMEOUT,
		}
		return {
			constraints: userConf.constraints ?? getDefaultConstraintFns(),
			maxSolutions: userConf.maxSolutions,
			dfs,
		}
	}
}

function getSelectionFunctionsFromOpts(opts: NonNullable<ConstraintSolverOpts['dfs']>) {
	let selectCell: SolverSelectCellFn;
	if (typeof opts.selectCell === 'string' && selectCellStrategies[opts.selectCell] != null) {
		selectCell = selectCellStrategies[opts.selectCell];
	} else if (typeof opts.selectCell === 'function') {
		selectCell = opts.selectCell;
	} else {
		// default to "firstEmpty"; important to default to a deterministic strategy, without randomization
		selectCell = selectCellStrategies.firstEmpty;
	}

	let selectValue: SolverSelectValueFn;
	if (typeof opts.selectValue === 'string' && selectValueStrategies[opts.selectValue] != null) {
		selectValue = selectValueStrategies[opts.selectValue];
	} else if (typeof opts.selectValue === 'function') {
		selectValue = opts.selectValue;
	} else {
		// default to "leastConstraining"; important to default to a deterministic strategy, without randomization
		selectValue = selectValueStrategies.leastConstraining;
	}

	return {
		selectCell,
		selectValue,
	};
}