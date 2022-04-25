import { defineStore } from "pinia";
import { usePuzzleStore } from "./puzzle.js";

export const usePuzzleMistakesStore = defineStore('puzzleMistakes', {
	state: () => ({
		checkId: -1,
		cache: new Map(),
		totalCellsFound: new Set(),
		currentMarked: [],
		lastCheckType: null, // user or auto
	}),

	getters: {
		totalUniqueChecks: state => state.cache.size,
		totalUniqueChecksWithResults: state => {
			const arr = Array.from(state.cache.values());
			return arr.filter(val => val?.length).length;
		},
		checkAssistanceData() {
			const checks = this.totalUniqueChecks;
			const checksWithResults = this.totalUniqueChecksWithResults;
			const incorrectCellsFound = this.totalCellsFound.size;
			return { checks, checksWithResults, incorrectCellsFound };
		},
	},

	actions: {
		reset() {
			this.$reset();
		},
		checkIncorrectCells({ boardStr, board, solution }) {
			let result = this.cache.get(boardStr);
			if (result == null) {
				result = checkForIncorrectCells({ board, solution });
				this.cache.set(boardStr, result);
			}
			this.checkId += 1;
			if (!Array.isArray(result)) {
				result = [];
			} else {
				result.forEach(cellId => this.totalCellsFound.add(cellId));
			}
			this.currentMarked = [...result];
		},
		checkErrors(boardStr) {
			const puzzleStore = usePuzzleStore();
			this.checkIncorrectCells({ boardStr, board: puzzleStore.board, solution: puzzleStore.solution });
		},
		userCheckErrors(boardStr) {
			this.lastCheckType = 'user';
			this.checkErrors(boardStr);
		},
		autoCheckFinishedWithMistakes() {
			const boardStr = usePuzzleStore().boardStr;
			this.lastCheckType = 'auto';
			this.checkErrors(boardStr);
		},
		resetMarkedCells() {
			this.currentMarked = [];
		},
		removeFromCurrentMarkedCells(cellId) {
			this.currentMarked = this.currentMarked.filter(val => val !== cellId);
		}
	}
})

function checkForIncorrectCells({ board, solution }) {
	const { hasMistakes, result } = board.hasIncorrectValues(solution);
	if (!hasMistakes) {
		return null;
	}
	return result.map(({ x, y }) => `${x},${y}`);
}