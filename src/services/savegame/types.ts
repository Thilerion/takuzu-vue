import type { AllPuzzleBoardExportStrings, AllPuzzleBoards, BasicPuzzleConfig } from "@/lib/types";
import type { UserBookmark } from "@/stores/bookmarks.js";
import type { HintSaveData } from "@/features/hints/store.js";
import type { MoveExport } from "@/stores/puzzle-history/models.js";


export interface PuzzleStoreSaveData extends BasicPuzzleConfig, AllPuzzleBoards {}

export interface SaveGame extends AllPuzzleBoardExportStrings, BasicPuzzleConfig {
	timeElapsed: number,
	moveList: MoveExport[],
	bookmarks: UserBookmark[],
	hints: HintSaveData,
}
export type SaveData = Omit<SaveGame, keyof AllPuzzleBoards> & AllPuzzleBoards;