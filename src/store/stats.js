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
		addFinishedPuzzleToDb({ }, historyEntry) {
			puzzleHistoryTable.add(historyEntry);
		}
	}

};