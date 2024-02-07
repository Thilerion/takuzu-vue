import type { PuzzleSymbol } from "@/lib/constants.js";
import type { SimpleBoard } from "@/lib/index.js";
import type { Vec } from "@/lib/types.js";
import type { SelectCellStrategyName, SelectValueStrategyName } from "./selection/index.js";

export type SolverSelectCellFn = (board: SimpleBoard) => Vec | null;
export type SolverSelectValueFn = (board: SimpleBoard, x: number, y: number) => PuzzleSymbol;

export type ConstraintSolverConfig = {
	selectCell: SelectCellStrategyName | SolverSelectCellFn,
	selectValue: SelectValueStrategyName | SolverSelectValueFn,
}