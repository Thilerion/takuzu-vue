import { PuzzleData } from "@/services/stats/models.js";
import { puzzleHistoryTable } from '@/services/stats/db.js';
import { getGameEndStats } from "@/services/stats/index.js";

export const statsModule = {
	namespaced: true,

	state: () => ({
		// puzzleHistory: [],
		gameEndStats: {},
		lastPuzzleEntry: {},
		modalHidden: false,
	}),

	getters: {

	},

	mutations: {
		setGameEndStats(state, stats = {}) {
			state.gameEndStats = stats;
		},
		setLastPuzzleEntry(state, puzzleEntry = {}) {
			state.lastPuzzleEntry = puzzleEntry;
		},
		setFinishedModalHidden(state, val) {
			state.modalHidden = val;
		}
	},

	actions: {
		async addFinishedPuzzleToHistory({ dispatch }, puzzleState) {
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
			commit('setFinishedModalHidden', false);
			return true;
		},
		clearGameEndStats({ commit }) {
			commit('setGameEndStats', {});
			commit('setLastPuzzleEntry', {});
			// commit('setFinishedModalHidden', false);
		}
	}

};