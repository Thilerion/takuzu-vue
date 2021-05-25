import { PuzzleData } from "@/services/stats/models";
import { puzzleHistoryTable } from '@/services/stats/db';

export const statsModule = {
	namespaced: true,

	state: () => ({
		// puzzleHistory: [],
	}),

	getters: {

	},

	mutations: {

	},

	actions: {
		addFinishedPuzzleToHistory({ dispatch }, gameState) {
			const historyEntry = PuzzleData.fromGameState(gameState);
			console.log(historyEntry);
			dispatch('addFinishedPuzzleToDb', historyEntry);
		},
		async addFinishedPuzzleToHistoryFromPuzzle({ dispatch }, puzzleState) {
			const historyEntry = PuzzleData.fromPuzzleState(puzzleState);
			await dispatch('addFinishedPuzzleToDb', historyEntry);
			return historyEntry;
		},
		addFinishedPuzzleToDb(_, historyEntry) {
			puzzleHistoryTable.add(historyEntry);
		}
	}

};