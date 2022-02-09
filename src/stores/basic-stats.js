import { puzzleHistoryTable } from "@/services/stats/db.js";
import { PuzzleData } from "@/services/stats/models.js";
import { getGameEndStats } from "@/services/stats/process-stats.js";
import { defineStore } from "pinia";

export const useBasicStatsStore = defineStore('basicStats', {

	state: () => ({
		gameEndStats: {},
		lastPuzzleEntry: {},
		modalHidden: true
	}),

	getters: {},

	actions: {
		async addFinishedPuzzleToHistory(puzzleState) {
			const historyEntry = PuzzleData.fromPuzzleState(puzzleState);
			this.addFinishedPuzzleToDb(historyEntry);
			return historyEntry;
		},
		addFinishedPuzzleToDb(historyEntry) {
			puzzleHistoryTable.add(historyEntry);
		},
		async getGameEndStats(historyEntry) {
			const { width, height, difficulty } = historyEntry;
			const result = await getGameEndStats({ width, height, difficulty });
			const gameEndStats = {
				...result,
				width, height, difficulty,
				previousAverage: (result.count > 1) ? (result.totalTime - historyEntry.timeElapsed) / (result.count - 1) : 0
			}
			this.$patch({
				gameEndStats,
				lastPuzzleEntry: historyEntry,
				modalHidden: false
			});
			return true;
		},
		clearGameEndStats() {
			this.$patch({
				gameEndStats: {},
				lastPuzzleEntry: {}
			})
		},

		toggleFinishedModal(shown) {
			this.modalHidden = !shown;
		}
	}

});