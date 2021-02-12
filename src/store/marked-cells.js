const initialState = () => ({
	activeCells: [],
})

const markedCellsModule = {

	state: initialState(),

	getters: {

	},

	mutations: {
		reset: (state) => {
			console.log('resetting markedCells state');
			const initial = initialState();
			for (const key of Object.keys(initial)) {
				state[key] = initial[key];
			}
		},
		
		setActiveCell: (state, { x, y }) => {
			state.activeCells = [{ x, y }];
		},
		unsetActiveCell: state => state.activeCells = [],

	},

	actions: {
		markCellDown({ commit }, { x, y }) {
			commit('setActiveCell', { x, y });
		},
		markCellUp({ commit }) {
			commit('unsetActiveCell');
		}
	}

}

export default markedCellsModule;