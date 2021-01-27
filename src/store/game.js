const initialState = () => ({
	initialized: false,
	width: null,
	height: null,
	difficulty: null
});

const gameModule = {
	state: () => initialState(),

	getters: {

	},

	mutations: {
		setInitialized(state, val) {
			state.initialized = val;
		},
		setDimensions(state, { width, height }) {
			state.width = width;
			state.height = height;
		},
		setDifficulty(state, difficulty) {
			state.difficulty = difficulty;
		},
		reset(state) {
			const initState = initialState();
			for (const key of Object.keys(initState)) {
				state[key] = initState[key];
			}
		},

		toggleCell(state, { x, y, value }) {
			console.log('toggling cell value...');
			console.log({ x, y, value });
		}
	},

	actions: {
		initGame({ commit }, { width, height, difficulty }) {
			commit('setInitialized', true);
			commit('setDimensions', { width, height });
			commit('setDifficulty', difficulty);
		}
	}
};

export default gameModule;