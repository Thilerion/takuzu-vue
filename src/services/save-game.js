export class SaveGameData {
	constructor(data) {
		const { width, height, difficulty, moveList, timeElapsed } = data;

		this.width = width;
		this.height = height;
		this.difficulty = difficulty;
		this.moveList = moveList;
		this.timeElapsed = timeElapsed;

		this.initialBoard = data.initialBoard.export();
		this.solution = data.solution.export();
		this.board = data.board.export();
	}

	saveToLocalStorage() {
		try {
			localStorage.setItem('takuzu_saved-game', JSON.stringify(this));
			return true;
		} catch (e) {
			console.warn('Could not save current game');
			return false;
		}
	}

	static loadFromLocalStorage() {
		try {
			const data = localStorage.getItem('takuzu_saved-game');
			if (!data) return false;
			const result = JSON.parse(data);

			if (!data.width || !data.height || !data.board) {
				return false;
			}

			return result;
		} catch (e) {
			console.warn('Could not load saved game');
			return false;
		}
	}
}

export async function loadSavedGame() {
	try {
		const data = localStorage.getItem('takuzu_saved-game');
		if (!data) return false;

		const result = JSON.parse(data);


	} catch (e) {
		console.warn('Could not load saved game');
		return false;
	}
}

export async function saveCurrentGame(state) {
	try {
		

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