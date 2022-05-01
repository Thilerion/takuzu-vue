import { PuzzleStatisticData } from "@/services/stats/db/models.js";
import * as StatsDB from "@/services/stats/db/index.js";
import { formatBasicSortableDateKey } from "@/utils/date.utils.js";
import { defineStore } from "pinia";
import { shallowReactive } from "vue";
import { isToday } from "date-fns/esm";
import { getUniqueDatesFromItems } from "@/services/stats/dates.js";

const getPuzzlesSolved = StatsDB.getCount;
const getAllHistoryItems = () => StatsDB.getAll().then(list => list.map(item => {
	return new PuzzleStatisticData(item);
}));

export const useStatisticsStore = defineStore('statistics', {
	state: () => ({
		initialized: false,
		initializedDate: null,
		isLoading: false,

		historyItems: shallowReactive([])
	}),

	getters: {
		puzzlesSolved: state => state.historyItems.length,
		noPuzzlesSolved: state => state.initialized && state.historyItems.length === 0,

		sortedByDate: state => [...state.historyItems].sort((a, b) => b.timestamp - a.timestamp),

		itemsSolvedToday: state => state.historyItems.filter(item => {
			const date = item.date ?? new Date(item.timestamp);
			return isToday(date);
		}),
		cellsFilled: state => state.historyItems.reduce((acc, val) => {
			return acc + (val.numCells);
		}, 0),

		uniqueDatesPlayed: state => getUniqueDatesFromItems(state.historyItems),

		timePlayed: state => state.historyItems.reduce((acc, val) => acc + val.timeElapsed, 0),

		historyItemsWithTimeRecord2() {
			const items = this.sortedByDate;

			const iterationTimeRecord = new Map();
			const currentRecords = new Map();
			const firstTimes = [];
			const withTimeRecord = [];

			for (let i = items.length - 1; i >= 0; i--) {
				const item = items[i];
				const { puzzleConfigKey, timeElapsed } = item;

				if (!iterationTimeRecord.has(puzzleConfigKey)) {
					iterationTimeRecord.set(puzzleConfigKey, timeElapsed);
					firstTimes.push(item.id);
				}
				const prev = iterationTimeRecord.get(puzzleConfigKey);
				if (timeElapsed < prev) {
					withTimeRecord.push(item.id);
					iterationTimeRecord.set(puzzleConfigKey, timeElapsed);
					currentRecords.set(puzzleConfigKey, item.id);
				}
			}

			return {
				first: firstTimes,
				current: [...currentRecords.values()],
				all: [...new Set([...withTimeRecord, ...firstTimes])]
			}
		},

		historyItemsWithTimeRecord() {
			const historyItems = [...this.sortedByDate].reverse();
			const iterationTimeRecord = new Map();
			const itemsWithTimeRecord = [];

			for (const item of historyItems) {
				const { puzzleConfigKey, timeElapsed } = item;
				if (!iterationTimeRecord.has(puzzleConfigKey)) {
					// first time solving doesn't count
					iterationTimeRecord.set(puzzleConfigKey, timeElapsed);
					continue;
				}
				const prevTimeRecord = iterationTimeRecord.get(puzzleConfigKey);
				if (timeElapsed < prevTimeRecord) {
					itemsWithTimeRecord.push(item.id);
					iterationTimeRecord.set(puzzleConfigKey, timeElapsed);
				}
			}
			return itemsWithTimeRecord;
		}
	},

	actions: {
		setHistoryItems(items) {
			this.historyItems = shallowReactive(items);
		},
		async markFavorite(id, value) {
			const dbVal = value ? 1 : 0;
			const success = await StatsDB.update(id, {
				'flags.favorite': dbVal
			});
			if (success) {
				const item = this.historyItems.find(i => i.id === id);
				item.flags = {
					...item.flags,
					favorite: value
				}
			}
			return success;
		},
		async deleteItem(id) {
			const idx = this.historyItems.findIndex(val => val.id === id);
			if (idx < 0) {
				console.warn('No item found with this id. Cannot delete it.');
				return;
			}
			await StatsDB.deleteItem(id);
			this.historyItems.splice(idx, 1);
		},
		setInitialized(value) {
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