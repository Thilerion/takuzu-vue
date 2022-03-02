import { dimensionsToBoardType, getAllBoardPresetSizes, getAllDifficultyValues, getAllSizeDifficultyCombinations } from "@/config.js";
import { getAllHistoryItems, getPuzzlesSolved, summarizeStatGroup } from "@/services/stats/data-handling.js";
import { groupBy } from "@/utils/array.utils.js";
import { parse, startOfDay, compareAsc, differenceInCalendarDays, addHours } from 'date-fns';
import { defineStore } from "pinia";
import { shallowReactive } from "vue";

export const useStatisticsStore = defineStore('statistics', {
	state: () => ({
		initialized: false,
		isLoading: false,

		historyItems: shallowReactive([])
	}),

	getters: {
		finishedLoading: state => state.initialized && !state.isLoading,
		puzzlesSolved: state => state.historyItems.length,
		showData() {
			return this.finishedLoading && this.puzzlesSolved > 0;
		},

		groupedBySize: state => groupBy(state.historyItems, 'dimensions', getSizeMap()),
		groupedByDifficulty: state => groupBy(state.historyItems, 'difficulty', getDiffMap()),
		groupedBySizeDifficultyCombination: state => groupBy(state.historyItems, 'dimensionDifficultyStr', getSizeDiffMap()),
		groupedByDate: state => groupBy(state.historyItems, 'dateStr'),
		groupedByBoardType: state => groupBy(state.historyItems, 'boardType'),

		sizeSummaries() {
			const groupsObj = this.groupedBySize;
			const result = [];
			for (const [size, items] of Object.entries(groupsObj)) {
				const summary = summarizeStatGroup(items);
				const { width, height, boardType, numCells } = sizeGroupsData.find(val => val.dimensions === size);
				const groupData = {
					size, width, height, boardType, numCells,
					groupType: 'size'
				};
				const groupResult = {
					...summary,
					groupData,
					items
				}
				result.push(groupResult);
			}
			return result;
		},
		difficultySummaries() {
			const groupsObj = this.groupedByDifficulty;
			const result = [];
			for (const [difficulty, items] of Object.entries(groupsObj)) {
				const summary = summarizeStatGroup(items);
				const groupData = {
					difficulty,
					groupType: 'difficulty'
				};
				const groupResult = {
					...summary,
					groupData,
					items
				}
				result.push(groupResult);
			}
			return result;
		},
		difficultySizeSummaries() {
			const groupsObj = this.groupedBySizeDifficultyCombination;
			const result = [];
			for (const [sizeDiffCombi, items] of Object.entries(groupsObj)) {
				if (!items.length) continue;
				const summary = summarizeStatGroup(items);
				const sizeDiffCombiData = sizeDiffCombiGroupsData.find(val => val.sizeDifficultyStr === sizeDiffCombi);
				
				const groupData = {
					...sizeDiffCombiData,
					groupType: 'sizeDiffCombi'
				}
				const groupResult = {
					...summary,
					groupData,
					items
				}
				result.push(groupResult);
			}
			return result;
		},
		dateSummaries() {
			const groupsObj = this.groupedByDate;
			const result = [];
			if (!this.historyItems.length) {
				return result;
			}
			const sortedItems = Object.entries(groupsObj).map(([dateStr, items]) => {
				const date = parse(dateStr + ' 12:00', 'yyyy-MM-dd HH:mm', new Date());
				return { dateStr, date, items };
			}).sort((a, b) => compareAsc(a.date, b.date));

			const today = addHours(startOfDay(new Date()), 12);

			const first = sortedItems[0];
			const last = sortedItems[sortedItems.length - 1];
			const { date: firstDate } = first;
			const { date: lastDate } = last;

			for (const {dateStr, date, items} of sortedItems) {
				if (!items.length) continue;
				const summary = summarizeStatGroup(items);
				const groupData = {
					dateStr,
					date,
					groupType: 'daily',
					distanceFromFirst: differenceInCalendarDays(date, firstDate),
					distanceFromLast: differenceInCalendarDays(lastDate, date),
					distanceFromToday: differenceInCalendarDays(today, date)
				};
				const groupResult = {
					...summary,
					groupData,
					items
				}
				result.push(groupResult);
			}
			return result;
		},
		allDatesWithPuzzlesSolved() {
			return this.dateSummaries.map(val => {
				return val.groupData.date;
			})
		}
	},

	actions: {
		setHistoryItems(items) {
			this.historyItems = shallowReactive(items);
		},
		// TODO: leftover mutations from vuex, convert to simple mutations at source
		setInitialized(value) {
			this.initialized = value;
		},
		setLoading() {
			this.isLoading = true;
		},
		setLoadingFinished() {
			this.isLoading = false;
		},

		async initialize() {
			if (this.isLoading) {
				console.warn('Cannot init stats if already loading.');
				return;
			}
			if (this.finishedLoading) {
				// check for change in puzzlesSolved
				const puzzlesSolved = await getPuzzlesSolved();
				if (puzzlesSolved !== this.puzzlesSolved) {
					this.setInitialized(false);
					this.setHistoryItems([]);
					this.setLoading();
				} else {
					return;
				}
			} else {
				this.setLoading();			
			}

			const puzzlesSolved = await getPuzzlesSolved();
			if (puzzlesSolved > 0) {
				const items = await getAllHistoryItems();
				this.setHistoryItems(items);
			} // else no puzzles solved: dont have to retrieve history items

			this.setLoadingFinished();
			this.setInitialized(true);
		},

		reset() {
			this.$reset();
		}
	}
})


const presetSizes = getAllBoardPresetSizes().map(({ width, height }) => {
	return `${width}x${height}`;
});
const difficulties = getAllDifficultyValues();
const sizeDifficultyCombinations = getAllSizeDifficultyCombinations();
const sizeGroupsData = getAllBoardPresetSizes().map(({ width, height }) => {
	const dimensions = `${width}x${height}`;
	const numCells = width * height;
	const boardType = dimensionsToBoardType(width, height);
	return { width, height, dimensions, numCells, boardType };
})
const sizeDiffCombiGroupsData = sizeDifficultyCombinations.map(({ width, height, difficulty }) => {
	const dimensions = `${width}x${height}`;
	const sizeDifficultyStr = `${dimensions}-${difficulty}`;
	const numCells = width * height;
	const boardType = dimensionsToBoardType(width, height);
	return { width, height, difficulty, dimensions, sizeDifficultyStr, numCells, boardType };
})

const objectWithKeys = (keysArr) => keysArr.reduce((result, key) => {
	result[key] = [];
	return result;
}, {});

const getSizeMap = () => objectWithKeys(presetSizes);
const getDiffMap = () => objectWithKeys(difficulties);
const getSizeDiffMap = () => objectWithKeys(sizeDifficultyCombinations);