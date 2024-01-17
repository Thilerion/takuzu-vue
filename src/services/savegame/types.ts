import type { AllPuzzleBoards, BasicPuzzleConfig, BoardExportString } from "@/lib/types";
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
export type SaveDataBoardStrings = {
	[Property in keyof SaveDataBoard]: BoardExportString
}

export interface SaveGame extends BasicPuzzleConfig, SaveDataBoardStrings {
	timeElapsed: number,
	moveList: MoveExport[]
}