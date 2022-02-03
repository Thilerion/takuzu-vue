import { dimensionsToBoardType, getAllBoardPresetSizes, getAllDifficultyValues, getAllSizeDifficultyCombinations } from "@/config.js";
import { getAllHistoryItems, getPuzzlesSolved, summarizeStatGroup } from "@/services/stats/data-handling.js";
import { groupBy } from "@/utils/array.utils.js";
import { parse, startOfDay, compareAsc, differenceInCalendarDays, addHours } from 'date-fns';

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

export const statsDataModule = {
	namespaced: true,

	state: () => ({
		initialized: false,
		isLoading: false,

		puzzlesSolved: null,

		historyItems: [],
	}),

	getters: {
		finishedLoading: state => state.initialized && !state.isLoading,
		showData: (state, getters) => getters.finishedLoading && state.puzzlesSolved > 0,

		totalTime: state => state.historyItems.reduce((acc, val) => {
			return val.timeElapsed + acc;
		}, 0),

		groupedBySize: state => {
			const items = state.historyItems;
			const initialMap = presetSizes.reduce((acc, val) => {
				acc[val] = [];
				return acc;
			}, {});
			return groupBy(items, 'dimensions', initialMap);
		},
		groupedByDifficulty: state => {
			const initialMap = difficulties.reduce((acc, val) => {
				acc[val] = [];
				return acc;
			}, {});
			return groupBy(state.historyItems, 'difficulty', initialMap);
		},
		groupedBySizeDifficultyCombination: state => {
			const initialMap = sizeDifficultyCombinations.reduce((acc, val) => {
				const { width, height, difficulty } = val;
				const key = `${width}x${height}-${difficulty}`;
				acc[key] = [];
				return acc;
			}, {});
			return groupBy(state.historyItems, 'dimensionDifficultyStr', initialMap);
		},
		groupedByDate: state => {
			return groupBy(state.historyItems, 'dateStr');
		},
		groupedByBoardType: state => {
			return groupBy(state.historyItems, 'boardType');
		},

		sizeSummaries: (state, getters) => {
			const groupsObj = getters.groupedBySize;
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

		difficultySummaries: (state, getters) => {
			const groupsObj = getters.groupedByDifficulty;
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

		difficultySizeSummaries: (state, getters) => {
			const groupsObj = getters.groupedBySizeDifficultyCombination;
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

		dateSummaries: (state, getters) => {
			const groupsObj = getters.groupedByDate;
			const result = [];
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

		allDatesWithPuzzlesSolved: (state, getters) => {
			return getters.dateSummaries.map(val => {
				if (!val.items.length) console.warn({ val });
				return val.groupData.date;
			})
		}
	},

	mutations: {
		setInitialized: (state, val) => state.initialized = val,
		setLoading: state => state.isLoading = true,
		setLoadingFinished: state => state.isLoading = false,

		setPuzzlesSolved: (state, val = 0) => state.puzzlesSolved = val,
		setHistoryItems: (state, items = []) => state.historyItems = items,
	},

	actions: {
		async initialize({ state, getters, commit }) {
			if (state.isLoading) {
				console.warn('Cannot init stats if already loading.');
				return;
			}
			if (getters.finishedLoading) {
				// check for change in puzzlesSolved
				console.warn('Cannot init stats if already initialized. Checking if there are changes in puzzlesSolved');
				const puzzlesSolved = await getPuzzlesSolved();
				if (puzzlesSolved !== state.puzzlesSolved) {
					console.log('Changes detected in puzzles solved. Should continue with initializing.');
					commit('setInitialized', false);
					commit('setHistoryItems', null);
					commit('setLoading');
					commit('setPuzzlesSolved', puzzlesSolved);
				} else {
					console.log('No changes in puzzles solved. Returning.');
					return;
				}
			} else {
				commit('setLoading');
				const puzzlesSolved = await getPuzzlesSolved();
				commit('setPuzzlesSolved', puzzlesSolved);
			}

			if (state.puzzlesSolved > 0) {
				const items = await getAllHistoryItems();
				commit('setHistoryItems', items);
			} else {
				console.log('No puzzles solved yet; finished loading stats.');
			}

			commit('setLoadingFinished');
			commit('setInitialized', true);
		},

		reset({ commit }) {
			commit('setInitialized', false);
			commit('setLoadingFinished');
			commit('setPuzzlesSolved', null);
			commit('setHistoryItems', []);
		}
	}

};