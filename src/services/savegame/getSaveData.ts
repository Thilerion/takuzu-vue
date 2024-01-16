import { usePuzzleStore } from "@/stores/puzzle";
import { exportMoveList } from "@/stores/puzzle-history";
import { getTotalTimeElapsed } from "@/stores/puzzle-timer";
import type { HistorySaveData, PuzzleSaveData, SaveData, TimerSaveData } from "./types";
import type { DifficultyKey } from "@/lib/types.js";
import { isDifficultyKey } from "@/config.js";

export const getSaveData = (): SaveData => {
	return {
		...getSaveDataFromPuzzleStore(),
		...getSaveDataFromTimer(),
		...getSaveDataFromHistory()
	}
}

function getSaveDataFromPuzzleStore (): PuzzleSaveData {
	const puzzleStore = usePuzzleStore();
	const { initialBoard, board, solution, width, height, difficulty } = puzzleStore;
	if (initialBoard == null || board == null || solution == null || width == null || height == null || difficulty == null) throw new Error('PuzzleStore is missing required properties.');
	if (!isDifficultyKey(difficulty)) throw new Error(`PuzzleStore has invalid difficulty: ${difficulty}`);
	return { initialBoard, board, solution, width, height, difficulty };
}
function getSaveDataFromTimer(): TimerSaveData {
	return { timeElapsed: getTotalTimeElapsed() };
}
function getSaveDataFromHistory(): HistorySaveData {
	return { moveList: exportMoveList() };
}