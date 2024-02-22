import { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";
import * as StatsDB from "@/services/db/stats-db/index.js";
import { isToday } from "date-fns";
import { defineStore } from "pinia";
import { reactive } from "vue";
import { getUniqueDatesFromItems } from "@/services/stats/dates.js";
import { formatBasicSortableDateKey } from "@/utils/date.utils.js";

const getPuzzlesSolved = (): Promise<number> => StatsDB.getCount();
const getAllHistoryItems = () => StatsDB.getAll().then(list => list.map(item => {
	return new StatsDbExtendedStatisticDataEntry(item);
}));

export type StatsStoreState = {
	initialized: false;
	initializedDate: null;
	isLoading: boolean;
	historyItems: [];
	editingNoteId: null;
} | {
	initialized: true;
	initializedDate: string;
	isLoading: boolean;
	historyItems: StatsDbExtendedStatisticDataEntry[];
	editingNoteId: number | null;
}

export const useStatisticsStore = defineStore('statistics', {
	state: (): StatsStoreState => ({
		initialized: false,
		initializedDate: null,
		isLoading: false,

		historyItems: reactive([]),

		editingNoteId: null
	}),

	getters: {
		isEditingNote: state => state.editingNoteId != null,
		puzzlesSolved: state => state.historyItems.length,
		noPuzzlesSolved: state => state.initialized && state.historyItems.length === 0,

		sortedByDate: (state): StatsDbExtendedStatisticDataEntry[] => [...state.historyItems].sort((a, b) => b.timestamp - a.timestamp),
		cellsFilled: state => state.historyItems.reduce((acc, val) => {
			return acc + (val.numCells);
		}, 0),
		
		itemsSolvedToday: state => state.historyItems.filter(item => {
			const date = item.date ?? new Date(item.timestamp);
			return isToday(date);
		}),

		uniqueDatesPlayed: state => getUniqueDatesFromItems(state.historyItems),

		timePlayed: state => state.historyItems.reduce((acc, val) => acc + val.timeElapsed, 0),
	},

	actions: {
		setHistoryItems(items: StatsDbExtendedStatisticDataEntry[]) {
			this.historyItems = reactive(items);
		},
		async markFavorite(id: number, value: boolean) {
			const dbVal = value ? 1 : 0;
			const success = await StatsDB.update(id, {
				'flags.favorite': dbVal
			});
			if (success) {
				const item = this.historyItems.find(i => i.id === id);
				if (item == null) {
					throw new Error('No item found with this id.');
				}
				item.flags = {
					...item.flags,
					favorite: value
				}
			}
			return success;
		},
		async saveNote(id: number, note: string | undefined) {
			const success = await StatsDB.update(id, {
				note
			});
			if (success) {
				const item = this.historyItems.find(i => i.id === id);
				if (item == null) {
					throw new Error('No item found with this id.');
				}
				item.note = note;
			}
			return success;
		},
		async deleteItem(id: number) {
			const idx = this.historyItems.findIndex(val => val.id === id);
			if (idx < 0) {
				console.warn('No item found with this id. Cannot delete it.');
				return;
			}
			await StatsDB.deleteItem(id);
			this.historyItems.splice(idx, 1);
		},
		setInitialized(value: boolean) {
			if (!value) {
				this.initialized = false;
				this.initializedDate = null;
				return;
			}
			this.initialized = true;
			this.initializedDate = formatBasicSortableDateKey(new Date());
		},
		async checkIfStatsNeedsUpdate() {
			// check for change in date; if so: reset stats
			if (formatBasicSortableDateKey(new Date()) !== this.initializedDate) {
				return true;
			} else if (await getPuzzlesSolved() !== this.puzzlesSolved) {
				return true;
			}
			return false;
		},
		async initialize({ forceUpdate = false } = {}) {
			if (forceUpdate) this.reset();

			if (this.isLoading) return;
			if (this.initialized) {
				const needReload = await this.checkIfStatsNeedsUpdate();
				if (!needReload) return;
				else this.reset();
			}

			this.isLoading = true;
			const puzzlesSolved = await getPuzzlesSolved();

			if (puzzlesSolved > 0) {
				const items = await getAllHistoryItems();
				this.setHistoryItems(items);
			}
			this.isLoading = false;
			this.setInitialized(true);
		},
		reset() {
			this.$reset();
		}
	}
})