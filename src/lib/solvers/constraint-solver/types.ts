import type { PuzzleSymbol } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import type { Vec } from "@/lib/types.js";
import type { ConstraintResult } from "./constraints/types.js";

export type SolverSelectCellFn = (board: SimpleBoard) => Vec | null;
export type SolverSelectValueFn = (board: SimpleBoard, x: number, y: number) => PuzzleSymbol;

export type ConstraintSolverConstraintsCollection = ReadonlyArray<((board: SimpleBoard) => ConstraintResult)>;