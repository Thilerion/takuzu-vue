import { deleteCurrentSavedGame, loadSavedGame } from "@/services/save-game";
import { SimpleBoard } from "../lib/board/Board";
import { EMPTY, OPPOSITE_VALUE } from "../lib/constants";
import { toggleValue } from "../lib/utils";
import gameCheckModule from "./game-check";

const worker = new Worker('../generate-worker.js', { type: 'module' });
const send = message => worker.postMessage({ message });
function initReceiver() {
	return new Promise((resolve, reject) => {
		worker.onmessage = event => {
			const { data } = event;
			if (data.error) reject(data.error);
			else resolve(data);
		}
	})
}

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
	toString() {
		return [this.x, this.y, this.value, this.prevValue].join(';');
	}
	static fromString(str) {
		const [x, y, value, prevValue] = str.split(';');
		return new PuzzleMove(x * 1, y * 1, value, prevValue);
	}
}

const initialState = () => ({
	initialized: false,
	loading: false,
	creationError: false,

	width: null,
	height: null,
	difficulty: null,

	initialBoard: null,
	board: null,
	solution: null,
	moveList: [],
});

const gameModule = {

	modules: { gameCheck: gameCheckModule },

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
		toggleOneFirst: (state, getters, rootState) => rootState.settings.toggleMode === '1',

		canSave: (state, getters) => {
			return state.initialized && !getters.finishedAndCorrect && state.board != null;
		},
	},

	mutations: {
		setInitialized(state, val) {
			state.initialized = val;
			state.creationError = false;
		},
		setLoading(state, val) {
			state.loading = val;
			state.creationError = false;
		},
		setCreationError(state, val) {
			state.creationError = val;
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

		// MOVE LIST
		resetMoveList(state, resetTo = []) {
			state.moveList = [...resetTo];
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
		async initGame({ commit, dispatch }, { width, height, difficulty }) {
			try {				
				await dispatch('createPuzzle', { width, height, difficulty });
				commit('setInitialized', true);
				commit('setDimensions', { width, height });
				commit('setDifficulty', difficulty);
			} catch (e) {
				console.warn(e);
				commit('reset');
				commit('setCreationError', true);
			}
		},
		async createPuzzle({ commit }, { width, height, difficulty = 1 }) {
			// TODO: improved "loading" indication and error display
			commit('setLoading', true);
			const receivedData = initReceiver();
			send({ width, height, difficulty });
			const interval = setInterval(() => {
				console.log('waiting...');
			}, 200);
			try {
				let data = await receivedData;
				clearInterval(interval);
				const { board: boardStr, solution: solutionStr } = data;
				console.log(boardStr, solutionStr);
				const board = SimpleBoard.fromString(boardStr);
				const solution = SimpleBoard.fromString(solutionStr);
				commit('setAllBoards', { board, solution, initialBoard: board.copy() });
				commit('setLoading', false);
			} catch (e) {
				clearInterval(interval);
				console.warn('Failed creating board');
				commit('setLoading', false);
				throw new Error(e);
			}
		},
		restartPuzzle({ state, commit }) {
			const board = state.initialBoard.copy();
			commit('setBoard', board);
			commit('resetPuzzleStateProps');
		},
		toggleCell({ commit, dispatch, getters }, { x, y, value, longTouch = false }) {
			// TODO: one or zero first setting for toggling
			const toggleOneFirst = getters.toggleOneFirst;
			let nextValue;
			if (!longTouch) {
				nextValue = toggleValue(value, toggleOneFirst);
			} else {
				// long touch switches 0 > 1 and 1 > 0, and sets EMPTY > opposite value that a standard touch would
				if (value === EMPTY || value == null) {
					nextValue = OPPOSITE_VALUE[toggleValue(value, toggleOneFirst)];
				} else {
					nextValue = OPPOSITE_VALUE[value];
				}
			}

			commit('setValue', { x, y, value: nextValue });
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
		checkAction({ rootState, dispatch }) {
			const checkFunction = rootState.settings.checkButton;
			if (checkFunction === 'incorrectValues') {
				return dispatch('gameCheck/findIncorrectValues');
			} else if (checkFunction === 'ruleViolations') {
				return dispatch('gameCheck/findRuleViolations');
			} else {
				console.warn('Unexpected value for "checkAction".');
			}
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
		},

		async loadSaved({ commit }) {
			try {
				const result = await loadSavedGame();
				console.log({ ...result });
				const { initialBoard, board, solution, moveList, width, height, difficulty } = result;
				commit('setDimensions', { width, height });
				commit('setDifficulty', difficulty);

				const parsedMoveList = moveList.map(str => {
					return PuzzleMove.fromString(str)
				});
				const parsedInitial = SimpleBoard.fromString(initialBoard);
				const parsedBoard = SimpleBoard.fromString(board);
				const parsedSolution = SimpleBoard.fromString(solution);

				commit('setAllBoards', {
					board: parsedBoard,
					initialBoard: parsedInitial,
					solution: parsedSolution
				});
				commit('resetMoveList', parsedMoveList);

				commit('setLoading', false);
				commit('setInitialized', true);
				console.log('loaded');
			} catch (e) {
				console.warn(e);
				return false;
			}
		},
		finishGame({ commit }) {
			commit('reset');
			deleteCurrentSavedGame();
		}
	}
};

export default gameModule;