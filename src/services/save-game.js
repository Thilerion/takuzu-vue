export async function loadSavedGame() {
	try {
		const data = localStorage.getItem('takuzu_saved-game');
		if (!data) return false;

		const result = JSON.parse(data);
		const { initialBoard, board, solution, moveList, width, height, difficulty, timeElapsed } = result;
		return { initialBoard, board, solution, moveList, width, height, difficulty, timeElapsed };

	} catch (e) {
		console.warn('Could not load saved game');
		return false;
	}
}

export async function saveCurrentGame(state) {
	try {
		const { initialBoard, board, solution, moveList, width, height, difficulty, timeElapsedUnmount } = state;

		const result = { width, height, difficulty, timeElapsed: timeElapsedUnmount };
		result.moveList = moveList.map(move => move.toString());
		result.initialBoard = initialBoard.export();
		result.board = board.export();
		result.solution = solution.export();

		localStorage.setItem('takuzu_saved-game', JSON.stringify(result));
		return true;
	} catch (e) {
		console.warn('Could not save current game');
		return false;
	}
}

export function deleteCurrentSavedGame() {
	localStorage.removeItem('takuzu_saved-game');
	return true;
}

export function hasCurrentSavedGame() {
	return localStorage.getItem('takuzu_saved-game') != null;
}