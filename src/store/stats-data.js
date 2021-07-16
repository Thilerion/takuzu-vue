import { getAllBoardPresetSizes, getAllDifficultyValues, getAllSizeDifficultyCombinations } from "@/config";
import { getAllHistoryItems, getPuzzlesSolved } from "@/services/stats/data-handling";
import { groupBy } from "@/utils/array.utils";

const presetSizes = getAllBoardPresetSizes().map(({ width, height }) => {
	return `${width}x${height}`;
});
const difficulties = getAllDifficultyValues();
const sizeDifficultyCombinations = getAllSizeDifficultyCombinations();

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
				acc[val] = [];
				return acc;
			}, {});
			return groupBy(state.historyItems, 'dimensionDifficultyStr', initialMap);
		},
		groupedByDate: state => {
			return groupBy(state.historyItems, 'dateStr');
		},
		groupedByBoardType: state => {
			return groupBy(state.historyItems, 'boardType');
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