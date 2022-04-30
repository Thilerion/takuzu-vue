import { useSavedPuzzle } from "@/services/useSavedPuzzle";
import { usePuzzleStore } from "../puzzle";
import { moveToString, usePuzzleHistoryStore } from "../puzzle-history";
import { usePuzzleTimer } from "../puzzle-timer"

export const getSaveData = () => {
	return {
		...getSaveDataFromPuzzleStore(),
		...getSaveDataFromTimer(),
		...getSaveDataFromHistory()
	}
}

export const savePuzzleSaveData = () => {
	const saveData = getSaveData();
	const { savePuzzle } = useSavedPuzzle();
	savePuzzle(saveData);
}

const getSaveDataFromPuzzleStore = () => {
	const puzzleStore = usePuzzleStore();
	const { initialBoard, board, solution, width, height, difficulty } = puzzleStore;
	return { initialBoard, board, solution, width, height, difficulty };
}

const getSaveDataFromTimer = () => {
	const timer = usePuzzleTimer();
	let timeElapsed = timer.timeElapsed;
	const { running, startTime } = timer;
	if (running && !!startTime) {
		timeElapsed += (Date.now() - startTime);
	}
	return {timeElapsed};
}

const getSaveDataFromHistory = () => {
	const history = usePuzzleHistoryStore();
	const moveList = history.moveList;
	return { moveList: moveList.map(moveToString) };
}