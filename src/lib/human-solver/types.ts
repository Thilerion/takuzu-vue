import type { BoardLine } from "../board/BoardLine";
import type { LineType } from "../constants";
import type { PuzzleBoards } from "../types";

export type ValueRange = [number, number];
export type HumanTechniquePuzzle = PuzzleBoards;
export type HumanTechniqueBoardOnly = Omit<HumanTechniquePuzzle, 'solution'>;

export type ElimTechniqueOpts = { least?: ValueRange, most?: ValueRange };

export type FilledLineRecord = Record<LineType, BoardLine[]>;