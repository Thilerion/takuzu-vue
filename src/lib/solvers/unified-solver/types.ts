import type { SimpleBoard } from "@/lib/board/Board.js";
import type { PuzzleSymbol } from "@/lib/constants.js";
import type { BoardExportString, Vec } from "@/lib/types.js";
import type { SelectCellStrategyName, SelectValueStrategyName } from "../constraint-solver/selection/index.js";

export type SolverSelectCellFn = (board: SimpleBoard) => Vec | null;
export type SolverSelectValueFn = (board: SimpleBoard, x: number, y: number) => PuzzleSymbol;

export type ConstraintStrategyResult =
	| {
		changed: true;
	}
	| {
		changed: false;
	}
	| {
		changed: false;
		invalid: true;
		message?: string;
	}
	| {
		changed: false;
		error: string | Error;
	};

export type ConstraintStrategy = (board: SimpleBoard) => ConstraintStrategyResult;

export type ConstraintPhaseConfig = {
	enabled: boolean;
	strategies: ReadonlyArray<ConstraintStrategy>;
};

export type DfsConfig = {
	enabled: boolean;
	maxSolutions: number;
	timeout: number | null;
	selectCell: SolverSelectCellFn | SelectCellStrategyName;
	selectValue: SolverSelectValueFn | SelectValueStrategyName;
	maxDepth?: number;
};

export type SolverConfig = {
	constraints: ConstraintPhaseConfig;
	dfs: DfsConfig;
};

export type SolverOpts = Partial<{
	constraints: Partial<ConstraintPhaseConfig>;
	dfs: Partial<DfsConfig> & Pick<DfsConfig, 'enabled'>;
}>;

export type SolverStopPhase = 'initial_check' | 'constraints' | 'dfs';

export type SolverResultBase = {
	status: 'solved' | 'incomplete' | 'unsolvable_invalid' | 'unsolvable_exhaustive' | 'unsolvable_partial' | 'error';
	stoppedAfter: SolverStopPhase;
	duration: number;
	partialBoard: BoardExportString | null;
};

export type SolverResultSolved = SolverResultBase & {
	status: 'solved';
	exhaustive: true;
	solutions: BoardExportString[];
};

export type SolverResultIncomplete = SolverResultBase & {
	status: 'incomplete';
	exhaustive: false;
	reason: 'max_solutions' | 'timed_out';
	solutions: BoardExportString[];
	maxSolutions?: number;
	timeout?: number;
};

export type SolverResultUnsolvableInvalid = SolverResultBase & {
	status: 'unsolvable_invalid';
	message?: string;
};

export type SolverResultUnsolvableExhaustive = SolverResultBase & {
	status: 'unsolvable_exhaustive';
	exhaustive: true;
};

export type SolverResultUnsolvablePartial = SolverResultBase & {
	status: 'unsolvable_partial';
	exhaustive: false;
	partialBoard: BoardExportString;
};

export type SolverResultError = SolverResultBase & {
	status: 'error';
	error: Error;
	context?: string;
};

export type SolverResult =
	| SolverResultSolved
	| SolverResultIncomplete
	| SolverResultUnsolvableInvalid
	| SolverResultUnsolvableExhaustive
	| SolverResultUnsolvablePartial
	| SolverResultError;

export type QuickFindSolutionOpts = Partial<{
	timeout: number | null;
	selectCell: SolverSelectCellFn | SelectCellStrategyName;
	selectValue: SolverSelectValueFn | SelectValueStrategyName;
}>;

export type FindAmountOfSolutionsOpts = Partial<{
	maxSolutions: number;
	timeout: number | null;
	selectCell: SolverSelectCellFn | SelectCellStrategyName;
	selectValue: SolverSelectValueFn | SelectValueStrategyName;
}>;

export type HasUniqueSolutionOpts = Partial<{
	constraints: Partial<ConstraintPhaseConfig>;
	dfs: Omit<Partial<DfsConfig>, 'maxSolutions'> & Pick<DfsConfig, 'enabled'>;
}>;
