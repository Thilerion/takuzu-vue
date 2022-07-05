import type { SimpleBoard } from "@/lib"
import type { BasicPuzzleConfig, BoardExportString } from "@/lib/types"
import type { MoveExport } from "@/stores/puzzle-history"

export interface TimerSaveData {
	timeElapsed: number
}
export interface HistorySaveData {
	moveList: MoveExport[]
}
export interface PuzzleSaveData extends SaveDataBoard, BasicPuzzleConfig {}
export interface SaveData extends TimerSaveData, HistorySaveData, PuzzleSaveData {}

export interface SaveDataBoard {
	board: SimpleBoard,
	initialBoard: SimpleBoard,
	solution: SimpleBoard
}
export type SaveDataBoardStrings = {
	[Property in keyof SaveDataBoard]: BoardExportString
}

export interface SaveGame extends BasicPuzzleConfig, SaveDataBoardStrings {
	timeElapsed: number,
	moveList: MoveExport[]
}