import { unique } from "@/utils/array.ts.utils.js";
import type { BoardExportString } from "@/lib/types.js";
import type {
	SolverResult,
	SolverResultError,
	SolverResultIncomplete,
	SolverResultSolved,
	SolverResultUnsolvableExhaustive,
	SolverResultUnsolvableInvalid,
	SolverResultUnsolvablePartial,
	SolverStopPhase,
} from "./types.js";

export type ResultBaseParams = {
	stoppedAfter: SolverStopPhase;
	duration: number;
	partialBoard: BoardExportString | null;
};

function solved(
	{ stoppedAfter, duration, partialBoard }: ResultBaseParams,
	solutions: BoardExportString[],
): SolverResultSolved {
	return {
		status: 'solved',
		exhaustive: true,
		stoppedAfter,
		duration,
		partialBoard,
		solutions: unique(solutions),
	};
}

function incomplete(
	{ stoppedAfter, duration, partialBoard }: ResultBaseParams,
	reason: { reason: 'max_solutions'; maxSolutions: number } | { reason: 'timed_out'; timeout: number },
	solutions: BoardExportString[],
): SolverResultIncomplete {
	return {
		status: 'incomplete',
		exhaustive: false,
		stoppedAfter,
		duration,
		partialBoard,
		solutions: unique(solutions),
		...reason,
	};
}

function unsolvableInvalid(
	{ stoppedAfter, duration, partialBoard }: ResultBaseParams,
	message?: string,
): SolverResultUnsolvableInvalid {
	return {
		status: 'unsolvable_invalid',
		stoppedAfter,
		duration,
		partialBoard,
		message,
	};
}

function unsolvableExhaustive(
	{ stoppedAfter, duration, partialBoard }: ResultBaseParams,
): SolverResultUnsolvableExhaustive {
	return {
		status: 'unsolvable_exhaustive',
		exhaustive: true,
		stoppedAfter,
		duration,
		partialBoard,
	};
}

function unsolvablePartial(
	{ stoppedAfter, duration }: Omit<ResultBaseParams, 'partialBoard'>,
	partialBoard: BoardExportString,
): SolverResultUnsolvablePartial {
	return {
		status: 'unsolvable_partial',
		exhaustive: false,
		stoppedAfter,
		duration,
		partialBoard,
	};
}

function error(
	{ stoppedAfter, duration, partialBoard }: ResultBaseParams,
	err: Error | string,
	context?: string,
): SolverResultError {
	return {
		status: 'error',
		stoppedAfter,
		duration,
		partialBoard,
		error: typeof err === 'string' ? new Error(err) : err,
		context,
	};
}

export const createSolverResult = {
	solved,
	incomplete,
	unsolvableInvalid,
	unsolvableExhaustive,
	unsolvablePartial,
	error,
};

export const isSolvedResult = (result: SolverResult): result is SolverResultSolved => result.status === 'solved';
