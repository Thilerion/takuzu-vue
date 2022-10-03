import { usePuzzleStore } from "@/stores/puzzle";
import { exportMoveList } from "@/stores/puzzle-history";
import { getTotalTimeElapsed } from "@/stores/puzzle-timer";
import type { HistorySaveData, PuzzleSaveData, SaveData, TimerSaveData } from "./types";

export const getSaveData = (): SaveData => {
	return {
		...getSaveDataFromPuzzleStore(),
		...getSaveDataFromTimer(),
		...getSaveDataFromHistory()
	}
}

function getSaveDataFromPuzzleStore (): PuzzleSaveData {
	const puzzleStore = usePuzzleStore();
	// TODO: 05-07-2022 remove casts when PuzzleStore is typed
	const { initialBoard, board, solution, width, height, difficulty } = (puzzleStore as unknown as PuzzleSaveData);
	return { initialBoard, board, solution, width, height, difficulty };
}
function getSaveDataFromTimer(): TimerSaveData {
	return { timeElapsed: getTotalTimeElapsed() };
}
function getSaveDataFromHistory(): HistorySaveData {
	return { moveList: exportMoveList() };
}