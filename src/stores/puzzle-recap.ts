import { StatsDbHistoryEntry, type StatsDbHistoryEntryWithId } from "@/services/db/stats-db/models";
import { defineStore } from "pinia";
import { statsDb } from "@/services/db/stats-db/init";
import { GameEndStats } from "@/services/puzzle-recap/GameEndStats";

export const usePuzzleRecapStore = defineStore('puzzleRecap', {
	state: () => ({
		// ui state
		modalShown: false,
		initialized: false,
		errorLoading: false,

		historyEntry: null as StatsDbHistoryEntry | null,

		// stats related to previously played
		gameEndStats: null as GameEndStats | null,
	}),

	getters: {
		isFavorite: (state) => {
			return !!(state.historyEntry?.flags?.favorite);
		},
		isSavedToDb: (state) => {
			return !!(state.historyEntry?.id);
		}
	},

	actions: {
		reset() {
			this.$reset();
		},
		showModal() {
			this.modalShown = true;
		},
		hideModal() {
			this.modalShown = false;
		},
		closeRecapModal() {
			this.hideModal();
			this.reset();
		},
		toggleModal(val?: boolean) {
			if (val == null) {
				this.modalShown = !this.modalShown;
			} else this.modalShown = val;
		},
		async toggleFavorite() {
			return this.markFavorite(!this.isFavorite);
		},
		async markFavorite(value = true) {
			// TODO: sync historyEntry with GameEndStats.historyEntry
			if (!this.gameEndStats!.isSavedToDb || this.historyEntry == null || this.historyEntry.id == null) {
				console.warn('Cannot mark as favorite because puzzle is not saved to database.');
				return;
			}
			const { id, flags: currentFlags } = this.historyEntry;
			const newFlags = { ...currentFlags, favorite: (value ? 1 : 0 as 1 | 0) };
			try {
				const success = await statsDb.updateItem(id, {
					flags: { ...newFlags }
				});
				if (success) {
					this.historyEntry.flags = { ...newFlags };
				} else {
					console.warn(`Could not set puzzle as "favorite = ${value}"`);
				}
				return success;
			} catch (e) {
				console.warn(`Could not set puzzle as "favorite = ${value}"`);
				console.error(e);
				return false;
			}
		},
		async saveNote(note: string | null | undefined = null) {
			// TODO: sync historyEntry with GameEndStats.historyEntry
			if (this.historyEntry == null || this.historyEntry.id == null) {
				console.warn('Cannot save note because puzzle is not saved to database.');
				return false;
			}
			const { id } = this.historyEntry;
			try {
				const success = await statsDb.updateItem(id, {
					note: note ?? undefined
				});
				if (success) {
					console.log('Succesfully saved note.');
					this.historyEntry.note = note ?? undefined;
				} else {
					console.error('Could not save note.');
				}
				return success;
			} catch (e) {
				console.warn('Error in saving note.');
				console.error(e);
				return false;
			}
		},

		async initialize(item: StatsDbHistoryEntry | StatsDbHistoryEntryWithId) {
			this.setHistoryEntry(item);
			this.errorLoading = false;
			try {
				await this.initializeGameEndStats();
			} catch(e) {
				this.errorLoading = true;
				this.gameEndStats = null;
			} finally {
				this.initialized = true;
				this.modalShown = true;
			}
		},

		async initializeGameEndStats() {
			if (this.historyEntry == null) {
				throw new Error('No history entry set!');
			}
			const stats = await GameEndStats.init(this.historyEntry);
			this.gameEndStats = stats;
		},

		setHistoryEntry(entry: StatsDbHistoryEntry) {
			this.historyEntry = entry;
		}
	}
})