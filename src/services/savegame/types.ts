import type { AllPuzzleBoardExportStrings, AllPuzzleBoards, BasicPuzzleConfig } from "@/lib/types";
import type { Bookmark } from "@/stores/bookmarks.js";
import type { MoveExport } from "@/stores/puzzle-history/models.js";


export interface PuzzleStoreSaveData extends BasicPuzzleConfig, AllPuzzleBoards {}

export interface SaveGame extends AllPuzzleBoardExportStrings, BasicPuzzleConfig {
	timeElapsed: number,
	moveList: MoveExport[],
	bookmarks: Bookmark[]
}
export type SaveData = Omit<SaveGame, keyof AllPuzzleBoards> & AllPuzzleBoards;