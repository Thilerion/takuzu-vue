import { puzzleHistoryTable, puzzleHistoryDb } from "@/services/stats/db.js";
import { HistoryDbEntry } from "@/services/stats/models.js";
import { getGameEndStats } from "@/services/stats/process-stats.js";
import { defineStore } from "pinia";

export const useBasicStatsStore = defineStore('basicStats', {

	state: () => ({
		gameEndStats: {},
		lastPuzzleEntry: {},
		modalHidden: true
	}),

	getters: {
		isSavedToDb: state => state.lastPuzzleEntry?.id != null,
	},

	actions: {
		async markFavorite(value = true) {
			if (!this.isSavedToDb) {
				console.error('Cannot mark as favorite; not saved to database.');
				return;
			}
			const { id } = this.lastPuzzleEntry;
			const success = await puzzleHistoryDb.update(
				id,
				{
					'flags.favorite': value ? 1 : 0
				}
			);
			if (success) {
				const currentFlags = this.lastPuzzleEntry.flags ?? {};
				this.lastPuzzleEntry.flags = {
					...currentFlags,
					favorite: value ? 1 : 0
				}
			}
			return success;
		},
		async addFinishedPuzzleToHistory(puzzleState) {
			const historyEntry = HistoryDbEntry.fromPuzzleState(puzzleState);

			if (puzzleState.assistance.cheatsUsed && false) {
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
				return historyEntry;
			} catch {
				console.warn('Could not save history entry!');
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