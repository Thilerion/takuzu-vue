import { PuzzleData } from "@/services/stats/models";
import { puzzleHistoryTable } from '@/services/stats/db';

export const statsModule = {
	namespaced: true,

	state: () => ({
		puzzleHistory: [],
	}),

	getters: {

	},

	mutations: {
		addToHistory(state, puzzleData) {
			state.puzzleHistory.push(puzzleData);
		},
		setInitialState(state, data) {
			for (const key of Object.keys(data)) {
				state[key] = data[key];
			}
		}
	},

	actions: {
		addFinishedPuzzleToHistory({ commit, dispatch }, gameState) {
			const historyEntry = PuzzleData.fromGameState(gameState);
			console.log(historyEntry);
			commit('addToHistory', historyEntry);
			dispatch('addFinishedPuzzleToDb', historyEntry);
		},
		initStats({state, commit}) {
			const currentState = { ...state };
			const loadedState = loadStatsFromStorage(currentState);

			commit('setInitialState', loadedState);
		},
		addFinishedPuzzleToDb({ }, historyEntry) {
			puzzleHistoryTable.add(historyEntry);
		}
	}

};

function loadStatsFromStorage(currentState) {
	try {
		const data = window.localStorage.getItem('takuzu-stats');
		if (!data) {
			throw new Error('No stats data in localStorage.');
		}
		const parsed = JSON.parse(data);
		const result = {};
		for (const key of Object.keys(currentState)) {
			result[key] = parsed[key] ?? currentState[key];
		}
		return result;
	} catch {
		console.warn('Could not load stats from LocalStorage.');
		return currentState;
	}
}

function saveStatsToStorage(value) {
	const json = JSON.stringify(value);
	window.localStorage.setItem('takuzu-stats', json);
}

export const initStatsWatcher = (store) => {
	store.dispatch('stats/initStats');

	const watchFn = (state) => state.stats;
	const watchCb = (stats) => {
		// console.log('Store stats watcher: saving stats');
		saveStatsToStorage(stats);
	}
	const opts = {
		deep: true,
		immediate: true
	}
	const watcher = store.watch(
		watchFn,
		watchCb,
		opts
	);
	// console.log('watcher initiated: stats');
	return watcher;
}