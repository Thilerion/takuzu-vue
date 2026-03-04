import type { SimpleBoard } from "@/lib/board/Board.js";
import { runConstraintsUntilStable } from "./constraints-loop.js";
import { runDfs } from "./dfs.js";
import { createSolverResult } from "./result.js";
import { createTimeoutChecker } from "./timeout.js";
import {
	DEFAULT_TIMEOUT_MS,
	getDefaultStrategies,
	getFastSearchStrategies,
	resolveSelectCell,
	resolveSelectValue,
} from "./defaults.js";
import type { BoardExportString } from "@/lib/types.js";
import type {
	FindAmountOfSolutionsOpts,
	HasUniqueSolutionOpts,
	QuickFindSolutionOpts,
	SolverConfig,
	SolverOpts,
	SolverResult,
} from "./types.js";

function getDurationMs(startTime: number): number {
	return performance.now() - startTime;
}

function getPartialBoardExport(board: SimpleBoard | null): BoardExportString | null {
	if (board == null) return null;
	return board.export();
}

function mergeSolverConfig(opts: SolverOpts = {}): SolverConfig {
	const constraintsEnabled = opts.constraints?.enabled ?? true;
	const constraintsStrategies = opts.constraints?.strategies ?? getDefaultStrategies();

	const dfsEnabled = opts.dfs?.enabled ?? true;
	const maxSolutions = opts.dfs?.maxSolutions ?? 1;
	const timeout = opts.dfs?.timeout ?? DEFAULT_TIMEOUT_MS;

	return {
		constraints: {
			enabled: constraintsEnabled,
			strategies: constraintsStrategies,
		},
		dfs: {
			enabled: dfsEnabled,
			maxSolutions,
			timeout,
			selectCell: opts.dfs?.selectCell ?? 'firstEmpty',
			selectValue: opts.dfs?.selectValue ?? 'leastConstraining',
			maxDepth: opts.dfs?.maxDepth,
		},
	};
}

export function solve(boardInput: SimpleBoard, opts: SolverOpts = {}): SolverResult {
	const startTime = performance.now();
	const config = mergeSolverConfig(opts);
	const board = boardInput.copy();
	let partialBoardExport: BoardExportString | null = null;

	try {
		if (!board.isValid()) {
			return createSolverResult.unsolvableInvalid(
				{ stoppedAfter: 'initial_check', duration: getDurationMs(startTime), partialBoard: null },
				'Invalid input board',
			);
		}

		if (board.isFilled()) {
			const solvedExport = board.export();
			return createSolverResult.solved(
				{ stoppedAfter: 'initial_check', duration: getDurationMs(startTime), partialBoard: solvedExport },
				[solvedExport],
			);
		}

		if (config.constraints.enabled) {
			const constraintsResult = runConstraintsUntilStable(board, config.constraints.strategies);
			if (constraintsResult.outcome === 'invalid') {
				return createSolverResult.unsolvableInvalid(
					{ stoppedAfter: 'constraints', duration: getDurationMs(startTime), partialBoard: null },
					constraintsResult.message ?? 'Board became invalid during constraints phase',
				);
			}
			if (constraintsResult.outcome === 'error') {
				return createSolverResult.error(
					{ stoppedAfter: 'constraints', duration: getDurationMs(startTime), partialBoard: null },
					constraintsResult.error,
					'Constraints phase raised an error',
				);
			}
			if (!board.isValid()) {
				return createSolverResult.unsolvableInvalid(
					{ stoppedAfter: 'constraints', duration: getDurationMs(startTime), partialBoard: null },
					'Board became invalid during constraints phase',
				);
			}
			partialBoardExport = getPartialBoardExport(board);

			if (board.isFilled()) {
				return createSolverResult.solved(
					{ stoppedAfter: 'constraints', duration: getDurationMs(startTime), partialBoard: partialBoardExport },
					[board.export()],
				);
			}
		}

		if (!config.dfs.enabled) {
			const partial = partialBoardExport ?? board.export();
			return createSolverResult.unsolvablePartial(
				{ stoppedAfter: 'constraints', duration: getDurationMs(startTime) },
				partial,
			);
		}

		const timeoutChecker = config.dfs.timeout == null ? null : createTimeoutChecker(config.dfs.timeout);
		const dfsResult = runDfs(board, {
			strategies: config.constraints.enabled ? config.constraints.strategies : [],
			selectCell: resolveSelectCell(config.dfs.selectCell),
			selectValue: resolveSelectValue(config.dfs.selectValue),
			maxSolutions: config.dfs.maxSolutions,
			timeoutChecker,
			maxDepth: config.dfs.maxDepth ?? null,
		});

		if (dfsResult.outcome === 'error') {
			return createSolverResult.error(
				{ stoppedAfter: 'dfs', duration: getDurationMs(startTime), partialBoard: partialBoardExport },
				dfsResult.error,
				'DFS phase raised an error',
			);
		}

		const solutions = dfsResult.solutions.map(s => s.export());
		if (dfsResult.outcome === 'finished') {
			if (solutions.length === 0) {
				return createSolverResult.unsolvableExhaustive({
					stoppedAfter: 'dfs',
					duration: getDurationMs(startTime),
					partialBoard: partialBoardExport,
				});
			}
			return createSolverResult.solved(
				{ stoppedAfter: 'dfs', duration: getDurationMs(startTime), partialBoard: partialBoardExport },
				solutions,
			);
		}

		if (dfsResult.outcome === 'max_solutions') {
			return createSolverResult.incomplete(
				{ stoppedAfter: 'dfs', duration: getDurationMs(startTime), partialBoard: partialBoardExport },
				{ reason: 'max_solutions', maxSolutions: config.dfs.maxSolutions },
				solutions,
			);
		}

		return createSolverResult.incomplete(
			{ stoppedAfter: 'dfs', duration: getDurationMs(startTime), partialBoard: partialBoardExport },
			{ reason: 'timed_out', timeout: timeoutChecker?.timeoutMs ?? config.dfs.timeout ?? DEFAULT_TIMEOUT_MS },
			solutions,
		);
	} catch (error) {
		return createSolverResult.error(
			{ stoppedAfter: 'initial_check', duration: getDurationMs(startTime), partialBoard: partialBoardExport },
			error instanceof Error ? error : new Error(String(error)),
			'Solver crashed with an unexpected error',
		);
	}
}

export function quickFindAnySolution(board: SimpleBoard, opts: QuickFindSolutionOpts = {}): SolverResult {
	return solve(board, {
		constraints: {
			enabled: true,
			strategies: getFastSearchStrategies(),
		},
		dfs: {
			enabled: true,
			maxSolutions: 1,
			timeout: opts.timeout ?? DEFAULT_TIMEOUT_MS,
			selectCell: opts.selectCell ?? 'firstEmpty',
			selectValue: opts.selectValue ?? 'random',
		},
	});
}

export function findAmountOfSolutions(board: SimpleBoard, opts: FindAmountOfSolutionsOpts = {}) {
	const result = solve(board, {
		constraints: {
			enabled: true,
			strategies: getFastSearchStrategies(),
		},
		dfs: {
			enabled: true,
			maxSolutions: opts.maxSolutions ?? 200,
			timeout: opts.timeout ?? DEFAULT_TIMEOUT_MS,
			selectCell: opts.selectCell ?? 'firstEmpty',
			selectValue: opts.selectValue ?? 'leastConstraining',
		},
	});

	const numSolutions = 'solutions' in result ? result.solutions.length : 0;
	const solvable = result.status === 'solved' || result.status === 'incomplete';
	return {
		numSolutions,
		solvable,
		result,
	};
}

export function hasUniqueSolution(board: SimpleBoard, opts: HasUniqueSolutionOpts = {}) {
	const result = solve(board, {
		constraints: {
			enabled: opts.constraints?.enabled ?? true,
			strategies: opts.constraints?.strategies ?? getDefaultStrategies(),
		},
		dfs: {
			enabled: opts.dfs?.enabled ?? true,
			maxSolutions: opts.dfs?.enabled === false ? 1 : 2,
			timeout: opts.dfs?.timeout ?? DEFAULT_TIMEOUT_MS,
			selectCell: opts.dfs?.selectCell ?? 'firstEmpty',
			selectValue: opts.dfs?.selectValue ?? 'leastConstraining',
			maxDepth: opts.dfs?.maxDepth,
		},
	});

	if (result.status === 'solved' && result.solutions.length === 1) {
		return {
			unique: true,
			solution: result.solutions[0],
			result,
		};
	}
	if (result.status === 'incomplete' && result.solutions.length === 1 && result.reason === 'timed_out') {
		return {
			unique: false,
			solution: null,
			result,
		};
	}
	return {
		unique: false,
		solution: null,
		result,
	};
}
