const puzzleAssistanceModule = {

	namespaced: true,

	state: () => ({
		errorCheckResult: null,
		errorCheckCells: [],
		errorCheckId: -1,
	}),

	getters: {

	},

	mutations: {
		incrementErrorCheckId: state => state.errorCheckId += 1,
		setErrorCheckResult: (state, val) => state.errorCheckResult = val,
		setErrorCheckCells: (state, cells = []) => state.errorCheckCells = cells,
		removeIdFromErrorCells: (state, id) => {
			state.errorCheckCells = state.errorCheckCells.filter(val => val !== id);
		},
		reset: state => {
			state.errorCheckCells = [];
			state.errorCheckId = -1;
			state.errorCheckResult = null;
		}
	},

	actions: {
		checkErrors({ commit, dispatch }) {
			dispatch('findIncorrectValues');
			commit('incrementErrorCheckId');
		},
		findIncorrectValues({ rootState, commit }) {
			const { board, solution } = rootState.puzzle;
			const { hasMistakes, result } = board.hasIncorrectValues(solution);

			if (!hasMistakes) {
				commit('setErrorCheckResult', false);
				commit('setErrorCheckCells', []);
				return;
			}

			commit('setErrorCheckResult', true);
			const incorrectCellIds = result.map(({ x, y }) => `${x},${y}`);
			commit('setErrorCheckCells', incorrectCellIds);			
		}
	}

};

export default puzzleAssistanceModule;