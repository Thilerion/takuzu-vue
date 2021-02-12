const initialState = () => ({
	activeCells: [],
	errorCells: [],
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

		addToErrorCells(state, cells = []) {
			state.errorCells.push(...cells);
		},
		unsetAllErrorCells(state) {
			state.errorCells = [];
		},
		removeCellFromErrorCells(state, { x, y }) {
			state.errorCells = state.errorCells.filter(cell => {
				if (cell.x === x && cell.y === y) return false;
				return true;
			})
		},

	},

	actions: {
		markCellDown({ commit }, { x, y }) {
			commit('setActiveCell', { x, y });
			commit('removeCellFromErrorCells', { x, y });
		},
		markCellUp({ commit }) {
			commit('unsetActiveCell');
			// TODO: maybe ? commit('removeCellFromErrorCells', { x, y });
		},
		markUndoCell({ commit }, { x, y }) {
			commit('setActiveCell', { x, y });
		},
		markInvalidValuesChecked({ commit }, result = []) {
			commit('unsetAllErrorCells');
			commit('unsetActiveCell');
			const resultCoords = result.map(cell => {
				return { x: cell.x, y: cell.y };
			})
			commit('addToErrorCells', resultCoords);
		}
	}

}

export default markedCellsModule;