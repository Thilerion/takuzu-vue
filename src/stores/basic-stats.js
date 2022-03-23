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

			if (puzzleState.assistance.cheatsUsed) {
				console.log('Cheats used; will not save entry to history.');
				return historyEntry;
			}

			const historyEntryUpdated = await this.addFinishedPuzzleToDb(historyEntry);
			console.log('Puzzle saved to history');
			return historyEntryUpdated;
		},
		async addFinishedPuzzleToDb(historyEntry) {
			try {
				const id = await puzzleHistoryTable.add(historyEntry);
				historyEntry.id = id;
			} catch {
				console.warn('Could not save history entry!');
			} finally {
				return historyEntry;
			}
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