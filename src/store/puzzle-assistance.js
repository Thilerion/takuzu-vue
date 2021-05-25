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
		checkErrors({ commit }) {
			const foundErrors = Math.random() < 0.5;

			commit('incrementErrorCheckId');
			commit('setErrorCheckResult', foundErrors);
		}
	}

};

export default puzzleAssistanceModule;