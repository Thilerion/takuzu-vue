import type { BoardLine } from "../board/BoardLine";
import type { LineType } from "../constants";
import type { BoardAndSolutionBoards } from "../types";

export type ValueRange = [number, number];
export type HumanTechniquePuzzle = BoardAndSolutionBoards;
export type HumanTechniqueBoardOnly = Omit<HumanTechniquePuzzle, 'solution'>;

export type ElimTechniqueOpts = { least?: ValueRange, most?: ValueRange };

export type FilledLineRecord = Record<LineType, BoardLine[]>;