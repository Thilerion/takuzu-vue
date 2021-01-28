import { SimpleBoard } from "../lib/board/Board";
import { EMPTY, ONE, ZERO } from "../lib/constants";
import { generateBoard } from "../lib/generation/board";
import { createBasicMask } from "../lib/generation/mask";
import { toggleValue } from "../lib/utils";

const initialState = () => ({
	initialized: false,
	width: null,
	height: null,
	difficulty: null,
	board: null,
	solution: null
});

const gameModule = {
	state: () => initialState(),

	getters: {
		finishedAndCorrect: state => {
			if (state.board == null || state.solution == null) return false;
			return state.board.equalsSolution(state.solution);
		}
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
		setBoard(state, { board, solution }) {
			state.board = board;
			state.solution = solution;
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
			dispatch('createPuzzle', { width, height });
		},
		createEmptyBoard({ commit }, { width, height }) {
			console.warn('Creating empty board. In the future, a real board should be generated for gameplay...');
			const board = SimpleBoard.empty(width, height);
			commit('setBoard', board);
		},
		createPuzzle({ commit }, { width, height }) {
			const solution = generateBoard(width, height);
			const board = createBasicMask(solution);
			commit('setBoard', { board, solution });
		}
	}
};

export default gameModule;