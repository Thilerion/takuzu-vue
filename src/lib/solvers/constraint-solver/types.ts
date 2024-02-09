import type { PuzzleSymbol } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import type { Vec } from "@/lib/types.js";
import type { ConstraintResult } from "./constraints/types.js";

export type SolverSelectCellFn = (board: SimpleBoard) => Vec | null;
export type SolverSelectValueFn = (board: SimpleBoard, x: number, y: number) => PuzzleSymbol;

export type ConstraintSolverResultSolvable = {
	solvable: true,
	numSolutions: number, // >= 1
	solutions: SimpleBoard[]
}
export type ConstraintSolverResultUnsolvable = {
	solvable: false,
	numSolutions: 0,
	solutions: never[],
	finalBoard?: SimpleBoard, // at the moment the solver could not find any more solutions
}
export type ConstraintSolverResult = ConstraintSolverResultSolvable | ConstraintSolverResultUnsolvable;

export type ConstraintSolverConstraintsCollection = ReadonlyArray<((board: SimpleBoard) => ConstraintResult)>;