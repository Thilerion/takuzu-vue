import { PuzzleData } from "@/services/stats/models";
import { puzzleHistoryTable } from '@/services/stats/db';
import { getGameEndStats } from "@/services/stats";

export const statsModule = {
	namespaced: true,

	state: () => ({
		// puzzleHistory: [],
		gameEndStats: {},
		lastPuzzleEntry: {},
	}),

	getters: {

	},

	mutations: {
		setGameEndStats(state, stats = {}) {
			state.gameEndStats = stats;
		},
		setLastPuzzleEntry(state, puzzleEntry = {}) {
			state.lastPuzzleEntry = puzzleEntry;
		} 
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
		},
		async getGameEndStats({ commit }, historyEntry) {
			const { width, height, difficulty } = historyEntry;
			const result = await getGameEndStats({ width, height, difficulty });
			const gameEndStats = {
				...result,
				width, height, difficulty,
				previousAverage: (result.count > 1) ? (result.totalTime - historyEntry.timeElapsed) / (result.count - 1) : 0
			}
			commit('setGameEndStats', gameEndStats);
			commit('setLastPuzzleEntry', historyEntry);
			console.log({ gameEndStats, historyEntry });
			return true;
		},
		clearGameEndStats({ commit }) {
			commit('setGameEndStats', {});
			commit('setLastPuzzleEntry', {});
		}
	}

};