import { SimpleBoard } from '../lib/board/Board';
import { sendWorkerMessage, initPuzzleWorkerReceiver } from '@/workers/generate-puzzle';

import puzzleTimerModule from './puzzle-timer';
import puzzleHistoryModule from './puzzle-history';
import { SaveGameData } from '@/services/save-game';

const defaultState = () => ({
	// game config
	width: null,
	height: null,
	difficulty: null,

	// game boards and state
	initialBoard: null,
	board: null,
	solution: null,
	solutionBoardStr: null,

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
			return state.solutionBoardStr === getters.boardStr;
		}
	},

	mutations: {
		setLoading: (state, val) => state.loading = val,
		setCreationError: (state, val) => state.creationError = val,
		setPuzzleConfig: (state, { width, height, difficulty }) => {
			state.width = width;
			state.height = height;
			state.difficulty = difficulty;
		},
		setAllBoards: (state, { board, solution, initialBoard }) => {
			state.board = board;
			state.solution = solution;
			state.initialBoard = initialBoard;
			state.solutionBoardStr = solution.toString();
		},
		reset: state => Object.assign(state, defaultState()),
		setInitialized: (state, val) => state.initialized = val,
		setStarted: (state, val) => state.started = val,
		setFinished: state => state.finished = true,

		// puzzle actions
		setValue: (state, {x, y, value}) => state.board.assign(x, y, value),
	},

	actions: {
		toggle({ commit, dispatch }, { x, y, value, prevValue }) {
			commit('setValue', { x, y, value });
			dispatch('history/addMove', { x, y, value: prevValue, nextValue: value });
		},
		undoLastMove({ getters, commit, dispatch }) {
			const move = {...getters['history/lastMove']};
			dispatch('history/undoMove');
			const { x, y, prevValue: value } = move;
			commit('setValue', { x, y, value });
		},
		async createPuzzle({ commit }, { width, height, difficulty }) {
			commit('setLoading', true);
			
			try {
				// setup worker message receiving and sending
				const receivedDataPromise = initPuzzleWorkerReceiver();
				sendWorkerMessage({ width, height, difficulty });
				console.log('awaiting data...');
				const data = await receivedDataPromise;
				console.log('data received!');
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
		finishPuzzle({ commit }) {
			SaveGameData.deleteSavedGame();
			commit('setFinished');
			commit('timer/pause');
		},

		reset({ state, commit }) {
			if (!state.initialized) {
				console.log('puzzle not initialized. cannot reset');
			} else {
				console.log('resetting puzzle state');
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
			console.log('saving game');
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