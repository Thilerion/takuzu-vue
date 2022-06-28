import type { SimpleBoard } from "../board/Board";
import type { PuzzleSymbol } from "../constants";
import type { Vec } from "../types";
import type { ConstraintFn } from "./constraints";

export interface SolverConfig {
	maxSolutions?: number,
	timeoutDuration?: number,
	throwAfterTimeout?: boolean,
	disableBacktracking?: boolean,
	selectCell?: (board: SimpleBoard) => Vec,
	selectValue?: (board: SimpleBoard, x: number, y: number) => PuzzleSymbol,
	constraintFns?: ConstraintFn[]
}