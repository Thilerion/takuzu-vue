import { SimpleBoard } from "../lib/board/Board";
import { EMPTY, ONE, ZERO } from "../lib/constants";
import { toggleValue } from "../lib/utils";

const initialState = () => ({
	initialized: false,
	width: null,
	height: null,
	difficulty: null,
	board: null
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
		setBoard(state, board) {
			state.board = board;
		},
		reset(state) {
			const initState = initialState();
			for (const key of Object.keys(initState)) {
				state[key] = initState[key];
			}
		},
		toggleCell(state, { x, y, value }) {
			// TODO: one or zero first setting for toggling
			const nextValue = toggleValue(value, false);

			state.board.assign(x, y, nextValue);
		}
	},

	actions: {
		initGame({ commit, dispatch }, { width, height, difficulty }) {
			commit('setInitialized', true);
			commit('setDimensions', { width, height });
			commit('setDifficulty', difficulty);
			dispatch('createEmptyBoard', { width, height });
		},
		createEmptyBoard({ commit }, { width, height }) {
			console.warn('Creating empty board. In the future, a real board should be generated for gameplay...');
			const board = SimpleBoard.empty(width, height);
			commit('setBoard', board);
		}
	}
};

export default gameModule;