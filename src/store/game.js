import { SimpleBoard } from "../lib/board/Board";
import { EMPTY, ONE, ZERO } from "../lib/constants";
import { generateBoard } from "../lib/generation/board";
import { createBasicMaskWithMaxDifficulty } from "../lib/generation/mask";
import { toggleValue } from "../lib/utils";

const initialState = () => ({
	initialized: false,
	width: null,
	height: null,
	difficulty: null,

	initialBoard: null,
	board: null,
	solution: null,

	markedIncorrectValues: []
});

const gameModule = {
	state: () => initialState(),

	getters: {
		finishedAndCorrect: state => {
			if (state.board == null || state.solution == null) return false;
			return state.board.equalsSolution(state.solution);
		},

		lockedCells: state => {
			if (state.initialBoard == null) return [];
			const cells = [...state.initialBoard.cells({
				skipFilled: false, skipEmpty: true
			})];
			return cells.map(cell => {
				return `${cell.x},${cell.y}`;
			})
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
		setBoard(state, { board, solution, initialBoard }) {
			state.board = board;
			state.solution = solution;
			state.initialBoard = initialBoard;
		},
		reset(state) {
			const initState = initialState();
			for (const key of Object.keys(initState)) {
				state[key] = initState[key];
			}
		},
		setValue(state, { x, y, value }) {
			state.board.assign(x, y, value);
		},
		setIncorrectValues(state, incorrectArr) {
			state.markedIncorrectValues = [...incorrectArr];
		},
		removeFromIncorrectValues(state, { x, y }) {
			const id = `${x},${y}`;
			const idx = state.markedIncorrectValues.indexOf(id);
			if (idx > -1) {
				state.markedIncorrectValues.splice(idx, 1);
			}
		}
	},

	actions: {
		initGame({ commit, dispatch }, { width, height, difficulty }) {
			commit('setInitialized', true);
			commit('setDimensions', { width, height });
			commit('setDifficulty', difficulty);
			dispatch('createPuzzle', { width, height, difficulty });
		},
		createEmptyBoard({ commit }, { width, height }) {
			console.warn('Creating empty board. In the future, a real board should be generated for gameplay...');
			const board = SimpleBoard.empty(width, height);
			commit('setBoard', board);
		},
		createPuzzle({ commit }, { width, height, difficulty = 1 }) {
			const solution = generateBoard(width, height);
			const board = createBasicMaskWithMaxDifficulty(solution, difficulty);
			commit('setBoard', { board, solution, initialBoard: board.copy() });
		},
		toggleCell({ commit }, { x, y, value }) {
			// TODO: one or zero first setting for toggling
			const nextValue = toggleValue(value, false);

			commit('setValue', { x, y, value: nextValue });
			commit('removeFromIncorrectValues', { x, y });
		},

		findIncorrectValues({ state, commit }) {
			const { board, solution } = state;
			const { hasMistakes, result } = board.hasIncorrectValues(solution);
			if (!hasMistakes) {
				commit('setIncorrectValues', []);
				return;
			} else {
				commit('setIncorrectValues', result.map(({ x, y }) => `${x},${y}`));
			}
		},
		checkAction({ dispatch }) {
			// TODO: check action be a) find incorrect values, or b) find rule violations
			dispatch('findIncorrectValues');
		}
	}
};

export default gameModule;