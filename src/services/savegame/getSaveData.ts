import { usePuzzleBookmarksStore } from "@/stores/bookmarks.js";
import type { PuzzleStoreSaveData, SaveData } from "./types";
import { isDifficultyKey } from "@/config.js";
import { exportMoveList } from "@/stores/puzzle-history/history-store.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { getTotalTimeElapsed } from "@/stores/puzzle/timer-store.js";

export const getSaveData = (): SaveData => {
	return {
		...getSaveDataFromPuzzleStore(),
		...getSaveDataFromTimer(),
		...getSaveDataFromHistory(),
		...getSaveDataFromBookmarkStore()
	}
}

function getSaveDataFromPuzzleStore (): PuzzleStoreSaveData {
	const puzzleStore = usePuzzleStore();
	const { initialBoard, board, solution, width, height, difficulty } = puzzleStore;
	if (initialBoard == null || board == null || solution == null || width == null || height == null || difficulty == null) throw new Error('PuzzleStore is missing required properties.');
	if (!isDifficultyKey(difficulty)) throw new Error(`PuzzleStore has invalid difficulty: ${difficulty}`);
	return { initialBoard, board, solution, width, height, difficulty };
}
function getSaveDataFromTimer(): Pick<SaveData, 'timeElapsed'> {
	return { timeElapsed: getTotalTimeElapsed() };
}
function getSaveDataFromHistory(): Pick<SaveData, 'moveList'> {
	return { moveList: exportMoveList() };
}
function getSaveDataFromBookmarkStore(): Pick<SaveData, 'bookmarks'> {
	const bookmarkStore = usePuzzleBookmarksStore();
	return {
		bookmarks: bookmarkStore.bookmarks.map(b => ({...b}))
	}
}