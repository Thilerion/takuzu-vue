import type { AllPuzzleBoardExportStrings, AllPuzzleBoards, BasicPuzzleConfig } from "@/lib/types";
import type { MoveExport } from "@/stores/puzzle-history";

export interface TimerSaveData {
	timeElapsed: number
}
export interface HistorySaveData {
	moveList: MoveExport[]
}
export interface PuzzleSaveData extends SaveDataBoard, BasicPuzzleConfig {}
export interface SaveData extends TimerSaveData, HistorySaveData, PuzzleSaveData {}

export type SaveDataBoard = AllPuzzleBoards;
export type SaveDataBoardStrings = AllPuzzleBoardExportStrings;

export interface SaveGame extends BasicPuzzleConfig, SaveDataBoardStrings {
	timeElapsed: number,
	moveList: MoveExport[]
}