import { getAllHistoryItems, getPuzzlesSolved } from "@/services/stats/data-handling.js";
import { formatBasicSortableDateKey } from "@/utils/date.utils.js";
import { defineStore } from "pinia";
import { shallowReactive } from "vue";

export const useStatisticsStore2 = defineStore('statistics2', {
	state: () => ({
		initialized: false,
		initializedDate: null,
		isLoading: false,

		historyItems: shallowReactive([])
	}),

	getters: {
		puzzlesSolved: state => state.historyItems.length,
		noPuzzlesSolved: state => state.initialized && state.historyItems.length === 0
	},

	actions: {
		setHistoryItems(items) {
			this.historyItems = shallowReactive(items);
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