import { SimpleBoard } from "../lib/board/Board";
import { EMPTY, ONE, ZERO, OPPOSITE_VALUE } from "../lib/constants";
import { generateBoard } from "../lib/generation/board";
import { createBasicMaskWithMaxDifficulty } from "../lib/generation/mask";
import { toggleValue } from "../lib/utils";

class PuzzleMove {
	constructor(x, y, value, prevValue) {
		this.x = x;
		this.y = y;

		this.value = value;
		this.prevValue = prevValue;
	}
	get cellId() {
		return `${this.x},${this.y}`;
	}
}

const initialState = () => ({
	initialized: false,
	width: null,
	height: null,
	difficulty: null,

	initialBoard: null,
	board: null,
	solution: null,
	moveList: [],

	// state associated with current puzzle state;
	markedIncorrectValues: [],
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
		},

		canUndo: state => state.moveList.length > 0,
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
		setAllBoards(state, { board, solution, initialBoard }) {
			state.board = board;
			state.solution = solution;
			state.initialBoard = initialBoard;
		},
		setBoard(state, board) {
			state.board = board;
		},
		resetPuzzleStateProps(state) {
			state.markedIncorrectValues = [];
			state.moveList = [];
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

		// INCORRECT MARKED VALUES
		setIncorrectValues(state, incorrectArr) {
			state.markedIncorrectValues = [...incorrectArr];
		},
		removeFromIncorrectValues(state, { x, y }) {
			const id = `${x},${y}`;
			const idx = state.markedIncorrectValues.indexOf(id);
			if (idx > -1) {
				state.markedIncorrectValues.splice(idx, 1);
			}
		},

		// MOVE LIST
		resetMoveList(state) {
			state.moveList = [];
		},
		addMove(state, move) {
			state.moveList.push(move);
		},
		replaceLastMove(state, move) {
			const idx = state.moveList.length - 1;
			state.moveList.splice(idx, 1, move);
		},
		popMove(state) {
			state.moveList.pop();
		},
	},

	actions: {
		initGame({ commit, dispatch }, { width, height, difficulty }) {
			commit('setInitialized', true);
			commit('setDimensions', { width, height });
			commit('setDifficulty', difficulty);
			dispatch('createPuzzle', { width, height, difficulty });
		},
		createPuzzle({ commit }, { width, height, difficulty = 1 }) {
			const solution = generateBoard(width, height);
			const board = createBasicMaskWithMaxDifficulty(solution, difficulty);
			commit('setAllBoards', { board, solution, initialBoard: board.copy() });
		},
		restartPuzzle({ state, commit }) {
			const board = state.initialBoard.copy();
			commit('setBoard', board);
			commit('resetPuzzleStateProps');
		},
		toggleCell({ commit, dispatch }, { x, y, value, longTouch = false }) {
			// TODO: one or zero first setting for toggling
			let nextValue;
			if (!longTouch) {
				nextValue = toggleValue(value, false);
			} else {
				// long touch switches 0 > 1 and 1 > 0, and sets EMPTY > opposite value that a standard touch would
				if (value === EMPTY || value == null) {
					nextValue = OPPOSITE_VALUE[toggleValue(value, false)];
				} else {
					nextValue = OPPOSITE_VALUE[value];
				}
			}

			commit('setValue', { x, y, value: nextValue });
			commit('removeFromIncorrectValues', { x, y });
			dispatch('addToggleToMoveList', { x, y, value, nextValue });
		},
		addToggleToMoveList({ state, commit }, { x, y, value, nextValue }) {
			const prevMove = state.moveList[state.moveList.length - 1];
			if (!prevMove || prevMove.x !== x || prevMove.y !== y) {
				commit('addMove', new PuzzleMove(x, y, nextValue, value));
				return;
			}
			const combinedMove = new PuzzleMove(x, y, nextValue, prevMove.prevValue);
			commit('replaceLastMove', combinedMove);
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
		},
		undo({ state, commit }) {
			const lastMove = state.moveList[state.moveList.length - 1];
			if (!lastMove || lastMove.x == null) {
				console.warn('cant undo...');
				return;
			}
			const { x, y, prevValue } = lastMove;

			commit('setValue', { x, y, value: prevValue });
			commit('popMove');
			commit('removeFromIncorrectValues', { x, y });
		}
	}
};

export default gameModule;