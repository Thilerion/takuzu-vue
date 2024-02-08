import type { PuzzleSymbol } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import type { Vec } from "@/lib/types.js";
import type { SelectCellStrategyName, SelectValueStrategyName } from "./selection/index.js";
import type { ConstraintResult } from "./constraints/types.js";

export type SolverSelectCellFn = (board: SimpleBoard) => Vec | null;
export type SolverSelectValueFn = (board: SimpleBoard, x: number, y: number) => PuzzleSymbol;

export type ConstraintSolverConfig = {
	selectCell: SelectCellStrategyName | SolverSelectCellFn,
	selectValue: SelectValueStrategyName | SolverSelectValueFn,
}

export type ConstraintSolverResultSolvable = {
	solvable: true,
	numSolutions: number, // >= 1
	solutions: SimpleBoard[]
}
export type ConstraintSolverResultUnsolvable = {
	solvable: false,
	numSolutions: 0,
	finalBoard?: SimpleBoard, // at the moment the solver could not find any more solutions
	error?: string,
}
export type ConstraintSolverResult = ConstraintSolverResultSolvable | ConstraintSolverResultUnsolvable;

export type ConstraintSolverConstraintsCollection = ReadonlyArray<((board: SimpleBoard) => ConstraintResult)>;