import { SimpleBoard } from '../../lib/board/Board.js';
import { sendWorkerMessage, initPuzzleWorkerReceiver } from '@/workers/generate-puzzle.js';

import puzzleTimerModule from './timer.js';
import puzzleHistoryModule from './history.js';
import puzzleAssistanceModule from './assistance.js';

import { SaveGameData } from '@/services/save-game.js';
import { calculateGridCounts, calculateLineCounts } from './line-counts.js';
import { COLUMN, EMPTY, ONE, ROW, ZERO } from '@/lib/constants.js';
import { getPuzzle } from '@/services/puzzles-db/db.js';
import { initPregenWorker } from '@/workers/pregen-puzzles.js';

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
			return state.board?.toString();
		},
		boardFilled: state => {
			return state.gridCounts[EMPTY] === 0;
		},
		finishedAndSolved: (state, getters) => {
			if (state.board == null || !state.initialized || !state.started) return false;
			if (!getters.boardFilled) return false;
			return state.solutionBoardStr === getters.boardStr;
		},
		finishedWithMistakes: (state, getters) => {
			if (state.board == null || !state.initialized || !state.started) return false;
			if (!getters.boardFilled) return false;
			return state.solutionBoardStr !== getters.boardStr;
		},
		progress: state => {
			const initialEmpty = state.initialEmpty;
			const currentEmpty = state.gridCounts[EMPTY];
			const progress = 1 - (currentEmpty / initialEmpty);
			return progress;
		},
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
		resetError: state => state.creationError = null,
		setInitialized: (state, val) => state.initialized = val,
		setStarted: (state, val) => state.started = val,
		setFinished: state => state.finished = true,
		setPaused: (state, val) => state.paused = val,

		// puzzle actions
		setValue: (state, { x, y, value, prevValue }) => {
			state.board.assign(x, y, value);
			state.gridCounts[value] += 1;
			state.gridCounts[prevValue] -= 1;
			state.rowCounts[y][value] += 1;
			state.rowCounts[y][prevValue] -= 1;
			state.colCounts[x][value] += 1;
			state.colCounts[x][prevValue] -= 1;
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
		setValue({ state, commit }, { x, y, value, prevValue }) {
			if (!prevValue) {
				prevValue = state.board.grid[y][x];
				console.log({ prevValue });
			}
			commit('setValue', { x, y, value, prevValue });

			commit('assistance/removeFromCurrentMarkedIncorrect', `${x},${y}`);
			commit('assistance/setHintVisible', false);
		},
		toggle({ state, dispatch }, { x, y, value, prevValue }) {
			if (!prevValue) {
				prevValue = state.board.grid[y][x];
				console.log({ prevValue });
			}
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
				const result = await getPuzzle({ width, height, difficulty });
				if (!result) throw new Error('No correct puzzle found');
				const board = SimpleBoard.import(result.boardStr);
				const solution = SimpleBoard.import(result.solutionStr);
				commit('setAllBoards', {
					board, solution,
					initialBoard: board.copy()
				});
				commit('setLoading', false);

				setTimeout(() => {
					initPregenWorker();
				}, 500);

				return;
			} catch (e) {
				console.warn(e);
				console.log('Error in getting puzzle from database. Proceeding the old-fashioned way.');
			}
			
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
		finishPuzzle({ state, getters, commit, dispatch }) {
			commit('setFinished');
			commit('timer/pause');

			let timeElapsed = state.timer.timeElapsed;
			const checkAssistanceData = getters['assistance/checkAssistanceData'];
			const hintAssistanceData = getters['assistance/hintAssistanceData']
			const finishedPuzzleState = {
				...state, timeElapsed, assistance: {
					checkData: checkAssistanceData,
					hintData: hintAssistanceData
				}
			};
			console.log({...finishedPuzzleState});

			return dispatch(
				'stats/addFinishedPuzzleToHistory',
				finishedPuzzleState,
				{ root: true }
			).then(historyEntry => {
				console.log('Puzzle saved to history.');
				SaveGameData.deleteSavedGame();
				return historyEntry;
			})			
		},

		reset({ state, commit }) {
			if (state.board != null && !state.initialized && !!state.board && !state.creationError) {
				console.log('puzzle not initialized. cannot reset');
				return;
			}
			commit('reset');
			commit('timer/reset');
			commit('history/reset');
			commit('assistance/reset');
		},
		restartPuzzle({ state, commit }) {
			SaveGameData.deleteSavedGame();
			const { initialBoard, solution } = state;
			const board = initialBoard.copy();
			commit('setAllBoards', { board, solution, initialBoard });
			commit('history/reset');
			commit('assistance/reset');
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

			// import moveLi.jsst
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