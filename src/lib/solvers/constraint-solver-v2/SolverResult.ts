import type { BoardExportString } from "@/lib/types.js";

export type SolverMethod = 'initial' | 'constraints' | 'dfs';
export type SolverResultType = 'solved' | 'error' | 'unsolvable_invalid' | 'unsolvable' | 'incomplete';

export type SolverResultBase<ResultType extends SolverResultType> = {
	status: ResultType;
	method: SolverMethod;
	// Can be used for additional contextual information, mostly for debugging I guess
	additionalMessage?: string;
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

export type SolverResultIncomplete = SolverResultBase<'incomplete'> & {
	exhaustive: false;
	partialSolutions: BoardExportString[];
};

export type SolverResult =
	| SolverResultSolved
	| SolverResultUnsolvableInvalid
	| SolverResultError
	| SolverResultUnsolvableExhaustive
	| SolverResultUnsolvablePartial
	| SolverResultIncomplete;

export function exhaustivelySolved(
	method: SolverMethod,
	solutions: BoardExportString[],
): SolverResultSolved {
	return {
		status: 'solved',
		method,
		solutions,
	}
}

export function unsolvableInvalid(
	method: SolverMethod,
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
		errMessage
	}
}

export function fromError(
	method: SolverMethod,
	error: string | Error,
	context: {
		description?: string, // for additional context
		isException?: boolean, // if true, this is an exception error that should be explicitly handled
	} = {}
): SolverResultError {
	return {
		status: 'error',
		method,
		error: typeof error === 'string' ? new Error(error) : error,
		context,
	}
}

export function unsolvableExhaustive(
	method: Extract<SolverMethod, 'dfs'>, // probably only "dfs"
	message?: string,
): SolverResultUnsolvableExhaustive {
	return {
		status: 'unsolvable',
		method,
		exhaustive: true,
		additionalMessage: message,
	}
}

export function unsolvablePartial(
	method: SolverMethod,
	partialSolution: BoardExportString,
): SolverResultUnsolvablePartial {
	return {
		status: 'unsolvable',
		method,
		exhaustive: false,
		partialSolution,
	}
}

export function incomplete(
	method: SolverMethod,
	partialSolutions: BoardExportString[],
): SolverResultIncomplete {
	return {
		status: 'incomplete',
		method,
		exhaustive: false,
		partialSolutions,
	}
}