import type { SimpleBoard } from "../board/Board";
import type { BoardLine } from "../board/BoardLine";
import type { LineType } from "../constants";

export type ValueRange = [number, number];
export type HumanTechniquePuzzle = {
	board: SimpleBoard,
	solution: SimpleBoard
}
export type HumanTechniqueBoardOnly = Omit<HumanTechniquePuzzle, 'solution'>;

export type ElimTechniqueOpts = { least?: ValueRange, most?: ValueRange };

export type FilledLineRecord = Record<LineType, BoardLine[]>;