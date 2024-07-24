import type { BoardExportString } from "@/lib/types.js";

export type SolverMethod = 'initial' | 'constraints' | 'dfs';
export type SolverResultType = 'solved' | 'error' | 'unsolvable_invalid' | 'unsolvable' | 'incomplete';

type SolverResultBase<ResultType extends SolverResultType> = {
	status: ResultType;
	method: SolverMethod;
	/** Time in ms that the solver took to run. */
	duration: number;
};

export type SolverResultSolved = SolverResultBase<'solved'> & {
	solutions: BoardExportString[];
};

export type SolverResultUnsolvableInvalid = SolverResultBase<'unsolvable_invalid'> & {
	errMessage?: string;
};
export type SolverResultUnsolvableExhaustive = SolverResultBase<'unsolvable'> & {
	exhaustive: true;
	partialSolution?: undefined;
};
export type SolverResultUnsolvablePartial = SolverResultBase<'unsolvable'> & {
	exhaustive: false;
	partialSolution: BoardExportString;
};

export type SolverResultError = SolverResultBase<'error'> & {
	error: Error;
	context: {
		description?: string, // for additional context
		isException?: boolean, // if true, this is an exception error that should be explicitly handled
	}
};

export type SolverResultIncompleteMaxSolutions = SolverResultBase<'incomplete'> & {
	exhaustive: false;
	partialSolutions: BoardExportString[];
	reason: 'max_solutions',
	/** Config value for maxSolutions */
	maxSolutions: number,
};
export type SolverResultIncompleteTimedOut = SolverResultBase<'incomplete'> & {
	exhaustive: false;
	partialSolutions: BoardExportString[];
	reason: 'timed_out',
	/** Config value for dfs timeout */
	timeout: number,
};
export type SolverResultIncomplete = SolverResultIncompleteMaxSolutions | SolverResultIncompleteTimedOut;

export type SolverResult =
	| SolverResultSolved
	| SolverResultUnsolvableInvalid
	| SolverResultError
	| SolverResultUnsolvableExhaustive
	| SolverResultUnsolvablePartial
	| SolverResultIncomplete;

export type CreateSolverResultBaseParams = {
	method: SolverMethod,
	duration: number,
}

export function exhaustivelySolved(
	{ method, duration }: CreateSolverResultBaseParams,
	solutions: BoardExportString[],
): SolverResultSolved {
	return {
		status: 'solved',
		method,
		duration,
		solutions,
	}
}

export function unsolvableInvalid(
	{ method, duration }: CreateSolverResultBaseParams,
	error?: string | Error,
): SolverResultUnsolvableInvalid {
	let errMessage: string | undefined;
	if (error != null) {
		if (typeof error === 'string') {
			errMessage = error;
		} else if (error instanceof Error) {
			errMessage = error.message;
		}
	}
	return {
		status: 'unsolvable_invalid',
		method,
		duration,
		errMessage
	}
}

export function fromError(
	{ method, duration }: CreateSolverResultBaseParams,
	error: string | Error,
	context: {
		description?: string, // for additional context
		isException?: boolean, // if true, this is an exception error that should be explicitly handled
	} = {}
): SolverResultError {
	return {
		status: 'error',
		method,
		duration,
		error: typeof error === 'string' ? new Error(error) : error,
		context,
	}
}

export function unsolvableExhaustive(
	{ method, duration }: CreateSolverResultBaseParams, // probably only "dfs" method here
): SolverResultUnsolvableExhaustive {
	if (method !== 'dfs') {
		console.warn(`[SolverResult.unsolvableExhaustive] received method "${method}", but expected "dfs". Is this correct?`);
	}
	return {
		status: 'unsolvable',
		method,
		duration,
		exhaustive: true,
	}
}

export function unsolvablePartial(
	{ method, duration }: CreateSolverResultBaseParams,
	partialSolution: BoardExportString,
): SolverResultUnsolvablePartial {
	return {
		status: 'unsolvable',
		method,
		duration,
		exhaustive: false,
		partialSolution,
	}
}

export function incomplete(
	{ method, duration }: CreateSolverResultBaseParams,
	incompleteReason: { reason: 'max_solutions', maxSolutions: number } | { reason: 'timed_out', timeout: number },
	partialSolutions: BoardExportString[],
): SolverResultIncomplete {
	return {
		status: 'incomplete',
		method,
		duration,
		exhaustive: false,
		partialSolutions,
		...incompleteReason,
	}
}