import type { BoardLine } from "../board/BoardLine";
import type { LineType } from "../constants";
import type { BoardAndSolutionBoards } from "../types";

export type ValueRange = [number, number];
export type HumanTechniquePuzzle = BoardAndSolutionBoards;
export type HumanTechniqueBoardOnly = Pick<BoardAndSolutionBoards, 'board'>;

export type ElimTechniqueOpts = { least?: ValueRange, most?: ValueRange };

export type FilledLineRecord = Record<LineType, BoardLine[]>;