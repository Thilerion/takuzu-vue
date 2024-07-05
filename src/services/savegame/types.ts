import type { AllPuzzleBoardExportStrings, AllPuzzleBoards, BasicPuzzleConfig } from "@/lib/types";
import type { UserBookmark } from "@/stores/bookmarks.js";
import type { HintSaveData } from "@/features/hints/store.js";
import type { MoveExport } from "@/stores/puzzle-history/models.js";
import type { CurrentGameConfig } from "@/stores/game.js";


export interface PuzzleStoreSaveData extends BasicPuzzleConfig, AllPuzzleBoards {}

export interface SaveGame extends AllPuzzleBoardExportStrings, BasicPuzzleConfig {
	timeElapsed: number,
	moveList: MoveExport[],
	bookmarks: UserBookmark[],
	hints: HintSaveData,
	gameConfig: CurrentGameConfig
}
export type SaveData = Omit<SaveGame, keyof AllPuzzleBoards> & AllPuzzleBoards;

export type ParsedSavedPuzzle = Omit<SaveData, keyof BasicPuzzleConfig | keyof AllPuzzleBoards> & { config: BasicPuzzleConfig, boards: AllPuzzleBoards };