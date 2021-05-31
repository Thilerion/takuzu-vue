function checkForIncorrectCells({ board, solution }) {
	const { hasMistakes, result } = board.hasIncorrectValues(solution);
	if (!hasMistakes) {
		return null;
	}
	return result.map(({ x, y }) => `${x},${y}`);
}

const defaultState = () => ({
	checkId: -1,
	cache: new Map(),
	totalCellsFound: new Set(),
	currentMarked: []
});

const assistanceIncorrectCheckModule = {
	state: defaultState(),

	getters: {

	},
	mutations: {
		reset: state => {
			Object.assign(state, defaultState());
		},
		incorrectCellsAddToCache(state, { key, value }) {
			state.cache.set(key, value);
		},
		incrementIncorrectCheckId(state) {
			state.checkId += 1;
		},
		addCellsToIncorrectCellsTotal(state, cellIds = []) {
			cellIds.forEach(cellId => state.totalCellsFound.add(cellId));
		},
		setCurrentIncorrectCells(state, cellIds = []) {
			state.currentMarked = [...cellIds];
		},
		removeFromCurrentMarkedIncorrect(state, cellId) {
			state.currentMarked = state.currentMarked.filter(val => val !== cellId);
		},
	},
	actions: {
		checkIncorrectCells({ state, commit }, { boardStr, board, solution }) {
			let result = state.cache.get(boardStr);
			if (result == null) {
				result = checkForIncorrectCells({ board, solution });
				commit('incorrectCellsAddToCache', { key: boardStr, value: result });
			}
			commit('incrementIncorrectCheckId');
			if (!Array.isArray(result)) {
				result = [];
			} else {
				commit('addCellsToIncorrectCellsTotal', result);
			}
			commit('setCurrentIncorrectCells', result);
		},
		checkErrors({ dispatch, rootState }, boardKey) {
			const { board, solution } = rootState.puzzle;
			dispatch('checkIncorrectCells', { boardStr: boardKey, board, solution });
		},
	}
}

export default assistanceIncorrectCheckModule;