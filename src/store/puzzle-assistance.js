const puzzleAssistanceModule = {

	namespaced: true,

	state: () => ({
		errorCheckResult: null,
		errorCheckId: -1,
	}),

	getters: {

	},

	mutations: {
		incrementErrorCheckId: state => state.errorCheckId += 1,
		setErrorCheckResult: (state, val) => state.errorCheckResult = val,
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
				return;
			}

			const incorrectCellIds = result.map(({ x, y }) => `${x},${y}`);
			commit('setErrorCheckResult', incorrectCellIds);
		}
	}

};

export default puzzleAssistanceModule;