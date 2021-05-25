import { SimpleBoard } from '../lib/board/Board';
import { sendWorkerMessage, initPuzzleWorkerReceiver } from '@/workers/generate-puzzle';

import puzzleTimerModule from './puzzle-timer';
import puzzleHistoryModule from './puzzle-history';
import puzzleAssistanceModule from './puzzle-assistance';

import { SaveGameData } from '@/services/save-game';
import { calculateGridCounts, calculateLineCounts } from './puzzle-line-counts';
import { COLUMN, EMPTY, ONE, ROW, ZERO } from '@/lib/constants';

const defaultState = () => ({
	// game config
	width: null,
	height: null,
	numCells: null,
	difficulty: null,

	// game boards and state
	initialBoard: null,
	board: null,
	solution: null,
	solutionBoardStr: null,

	initialEmpty: null,
	rowCounts: [],
	colCounts: [],
	gridCounts: {},

	// play/ui state
	initialized: false,
	started: false,
	paused: false,
	finished: false,

	// game creation state/error
	loading: false,
	creationError: false,
});

const puzzleModule = {
	namespaced: true,

	modules: {
		timer: puzzleTimerModule,
		history: puzzleHistoryModule,
		assistance: puzzleAssistanceModule,
		// gameCheck
		// markedCells
	},

	state: defaultState(),

	getters: {
		boardStr: state => {
			return state.board.toString();
		},
		finishedAndSolved: (state, getters) => {
			if (state.board == null || !state.initialized || !state.started) return false;
			if (getters.progress < 1) return false;
			return state.solutionBoardStr === getters.boardStr;
		},
		progress: state => {
			const initialEmpty = state.initialEmpty;
			const currentEmpty = state.gridCounts[EMPTY];
			const progress = 1 - (currentEmpty / initialEmpty);
			return progress;
		},
		currentCounts: state => {
			const transformCount = lineCount => {
				const zero = lineCount[ZERO];
				const one = lineCount[ONE];
				return [zero, one];
			}
			const row = state.rowCounts.map(transformCount);
			const column = state.colCounts.map(transformCount);
			return { [ROW]: row, [COLUMN]: column };
		},
		remainingCounts: (state, getters) => {
			const currentCounts = getters.currentCounts;
			const currentRow = currentCounts[ROW];
			const currentColumn = currentCounts[COLUMN];
			const requiredRow = state.board.numRequired[ROW];
			const requiredColumn = state.board.numRequired[COLUMN];

			const remainingRow = currentRow.map(val => {
				const [zero, one] = val;
				return [requiredRow[ZERO] - zero, requiredRow[ONE] - one];
			})
			const remainingColumn = currentColumn.map(val => {
				const [zero, one] = val;
				return [requiredColumn[ZERO] - zero, requiredColumn[ONE] - one];
			})
			return { [ROW]: remainingRow, [COLUMN]: remainingColumn };
		}
	},

	mutations: {
		setLoading: (state, val) => state.loading = val,
		setCreationError: (state, val) => state.creationError = val,
		setPuzzleConfig: (state, { width, height, difficulty }) => {
			state.width = width;
			state.height = height;
			state.difficulty = difficulty;
			state.numCells = width * height;
		},
		setAllBoards: (state, { board, solution, initialBoard }) => {
			state.board = board;
			state.solution = solution;
			state.initialBoard = initialBoard;
			state.solutionBoardStr = solution.toString();

			const { rowCounts, colCounts } = calculateLineCounts(board);
			state.rowCounts = rowCounts;
			state.colCounts = colCounts;
			
			state.gridCounts = calculateGridCounts(board);

			state.initialEmpty = [...state.initialBoard.cells({ skipFilled: true })].length;
		},
		reset: state => Object.assign(state, defaultState()),
		setInitialized: (state, val) => state.initialized = val,
		setStarted: (state, val) => state.started = val,
		setFinished: state => state.finished = true,
		setPaused: (state, val) => state.paused = val,

		// puzzle actions
		setValue: (state, { x, y, value }) => state.board.assign(x, y, value),
		updateGridCount: (state, { value, amount }) => state.gridCounts[value] += amount,
		updateRowCount: (state, { lineIndex, value, prevValue }) => {
			const rowCount = state.rowCounts[lineIndex];
			rowCount[value] += 1;
			rowCount[prevValue] -= 1;
		},
		updateColumnCount: (state, { lineIndex, value, prevValue }) => {
			const colCount = state.colCounts[lineIndex];
			colCount[value] += 1;
			colCount[prevValue] -= 1;
		},
	},

	actions: {
		pauseGame({ commit }, value) {
			commit('setPaused', value);
			if (value) {
				commit('timer/pause');
			} else {
				commit('timer/resume');
			}
		},
		setValue({ commit }, { x, y, value, prevValue }) {
			commit('setValue', { x, y, value });
			commit('updateGridCount', { value, amount: 1 });
			commit('updateGridCount', { value: prevValue, amount: -1 });

			commit('updateRowCount', { lineIndex: y, value, prevValue });
			commit('updateColumnCount', { lineIndex: x, value, prevValue });
		},
		toggle({ dispatch }, { x, y, value, prevValue }) {
			dispatch('setValue', { x, y, value, prevValue });
			dispatch('history/addMove', { x, y, value: prevValue, nextValue: value });
		},
		undoLastMove({ getters, dispatch }) {
			const move = {...getters['history/lastMove']};
			dispatch('history/undoMove');
			const { x, y, prevValue: value, value: prevValue } = move;
			dispatch('setValue', { x, y, value, prevValue });
		},
		async createPuzzle({ commit }, { width, height, difficulty }) {
			commit('setLoading', true);
			
			try {
				// setup worker message receiving and sending
				const receivedDataPromise = initPuzzleWorkerReceiver();
				sendWorkerMessage({ width, height, difficulty });
				const data = await receivedDataPromise;
				const {
					board: boardStr, solution: solutionStr
				} = data;

				const board = SimpleBoard.fromString(boardStr);
				const solution = SimpleBoard.fromString(solutionStr);

				commit('setAllBoards', {
					board, solution,
					initialBoard: board.copy()
				});
			} catch (e) {
				console.error('Failed creating board');
				console.warn(e);
				throw new Error(e);
			} finally {
				commit('setLoading', false);
			}		
		},
		async initPuzzle({ commit, dispatch }, puzzleConfig = {}) {
			try {
				await dispatch('createPuzzle', puzzleConfig);
				commit('setInitialized', true);
				commit('setPuzzleConfig', puzzleConfig);
			} catch (e) {
				dispatch('reset');
				commit('setCreationError', true);
				throw new Error(e);
			}
		},
		finishPuzzle({ state, commit, dispatch }) {
			commit('setFinished');
			commit('timer/pause');

			let timeElapsed = state.timer.timeElapsed;
			const finishedPuzzleState = { ...state, timeElapsed };

			return dispatch('stats/addFinishedPuzzleToHistoryFromPuzzle', finishedPuzzleState, { root: true }).then(historyEntry => {
				console.log('Puzzle saved to history.');
				SaveGameData.deleteSavedGame();
				return historyEntry;
			})			
		},

		reset({ state, commit }) {
			if (!state.initialized) {
				// console.log('puzzle not initialized. cannot reset');
				return;
			}
			commit('reset');
			commit('timer/reset');
			commit('history/reset');
		},
		restartPuzzle({ state, commit }) {
			SaveGameData.deleteSavedGame();
			const { initialBoard, solution } = state;
			const board = initialBoard.copy();
			commit('setAllBoards', { board, solution, initialBoard });
			commit('history/reset');
			// TODO: reset timer as well?
		},

		startPuzzle({ state, commit }) {
			if (!state.initialized) throw new Error('Cannot start uninitialized game!');
			if (state.started) throw new Error('Cannot start a game that already has started !');

			commit('setStarted', true);
			commit('timer/start');
		},

		async savePuzzle({ state, dispatch }) {
			let timeElapsed = state.timer.timeElapsed;
			if (state.timer.running && !!state.timer.startTime) {
				timeElapsed += (Date.now() - state.timer.startTime);
			}
			const { initialBoard, board, solution, width, height, difficulty } = state;
			const moveList = await dispatch('history/exportMoveHistory');			
			
			const saveGameData = new SaveGameData({
				moveList, timeElapsed, initialBoard, board, solution, width, height, difficulty
			});
			saveGameData.saveToLocalStorage();
		},
		loadSavedPuzzle({ commit, dispatch }) {
			dispatch('reset');
			const saveData = SaveGameData.loadFromLocalStorage();

			// import moveList
			const { moveList } = saveData;
			const { width, height, difficulty } = saveData;
			commit('setPuzzleConfig', { width, height, difficulty });
			
			// set time elapsed
			const { timeElapsed } = saveData;
			commit('timer/setInitialTimeElapsed', timeElapsed);
			// start timer?

			const initialBoard = SimpleBoard.fromString(saveData.initialBoard);
			const board = SimpleBoard.fromString(saveData.board);
			const solution = SimpleBoard.fromString(saveData.solution);
			commit('setAllBoards', { initialBoard, board, solution });

			dispatch('history/importMoveHistory', moveList);
			
			
			commit('setInitialized', true);

		},
	}

}

export default puzzleModule;