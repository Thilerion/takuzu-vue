import { SimpleBoard } from '../../lib/board/Board.js';

import { calculateGridCounts, calculateLineCounts } from './line-counts.js';
import { EMPTY, ONE, ZERO } from '@/lib/constants.js';
import { initPregenWorker } from '@/workers/pregen-puzzles.js';
import { useSettingsStore } from '../../stores/settings.js';
import { unref } from 'vue';
import { useBasicStatsStore } from '@/stores/basic-stats.js';
import { usePuzzleTimer } from '@/stores/puzzle-timer.js';
import { usePuzzleHistoryStore } from '@/stores/puzzle-history.js';
import { usePuzzleHintsStore } from '@/stores/puzzle-hinter.js';
import { requestPuzzle } from '@/services/create-puzzle.js';
import { usePuzzleMistakesStore } from '@/stores/puzzle-mistakes.js';
import { useSavedPuzzle } from '@/services/useSavedPuzzle.js';

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

	// state relevant for recap/puzzleHistory/stats
	cheatsUsed: false,

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
		// assistance: puzzleAssistanceModule,
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

		setCheatUsed: state => state.cheatsUsed = true,

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
			const timer = usePuzzleTimer();
			if (value) {
				timer.pause();
				// commit('timer/pause');
			} else {
				timer.resume();
				// commit('timer/resume');
			}
		},
		setValue({ state, commit }, { x, y, value, prevValue }) {
			if (!prevValue) {
				prevValue = state.board.grid[y][x];
				console.log({ prevValue });
			}
			commit('setValue', { x, y, value, prevValue });

			usePuzzleMistakesStore().removeFromCurrentMarkedCells(`${x},${y}`);
			usePuzzleHintsStore().showHint = false;
		},
		toggle({ state, dispatch }, { x, y, value, prevValue }) {
			if (!prevValue) {
				prevValue = state.board.grid[y][x];
			}
			if (!value) {
				const settingsStore = useSettingsStore();
				const toggleFirst = settingsStore.toggleMode;
				if (prevValue === EMPTY) {
					value = unref(toggleFirst);
				} else if (prevValue === ZERO) {
					value = toggleFirst === ZERO ? ONE : EMPTY;
				} else if (prevValue === ONE) {
					value = toggleFirst === ZERO ? EMPTY : ZERO;
				}
			}
			dispatch('setValue', { x, y, value, prevValue });
			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.addMove({ x, y, value: prevValue, nextValue: value });
		},
		undoLastMove({ dispatch }) {
			const puzzleHistory = usePuzzleHistoryStore();
			const move = { ...puzzleHistory.lastMove };
			puzzleHistory.undoMove();
			const { x, y, prevValue: value, value: prevValue } = move;
			dispatch('setValue', { x, y, value, prevValue });
		},
		async createPuzzle({ commit }, { width, height, difficulty }) {
			commit('setLoading', true);

			try {
				const { success, data, reason } = await requestPuzzle({ width, height, difficulty });
				if (success) {
					const { boardStr, solutionStr } = data;
					const board = SimpleBoard.import(boardStr);
					const solution = SimpleBoard.import(solutionStr);
					const initialBoard = board.copy();
					commit('setAllBoards', { board, solution, initialBoard });
					commit('setLoading', false);

					setTimeout(() => {
						initPregenWorker();
					}, 1000);
				} else {
					throw new Error(reason);
				}
			} catch (e) {
				commit('setLoading', false);
				throw new Error(e);
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
		async finishPuzzle({ state, getters, commit, dispatch }) {
			commit('setFinished');
			const timer = usePuzzleTimer();
			timer.pause();
			// commit('timer/pause');

			let timeElapsed = timer.timeElapsed;
			const checkAssistanceData = usePuzzleMistakesStore().checkAssistanceData;
			const hintAssistanceData = usePuzzleHintsStore().hintAssistanceData;
			const finishedPuzzleState = {
				...state, timeElapsed, assistance: {
					checkData: checkAssistanceData,
					hintData: hintAssistanceData,
					cheatsUsed: state.cheatsUsed
				}
			};
			console.log({ ...finishedPuzzleState });
			
			const basicStatsStore = useBasicStatsStore();

			try {
				const historyEntry = await basicStatsStore.addFinishedPuzzleToHistory(finishedPuzzleState);
				return historyEntry;
			} catch (e) {
				console.warn('Could not add finished puzzle to history...');
				console.warn(e);
				return null;
			} finally {
				console.log('deleting saved puzzle');
				const { deleteSavedPuzzle } = useSavedPuzzle();
				deleteSavedPuzzle();
			}
		},

		reset({ state, commit }) {
			if (state.board != null && !state.initialized && !!state.board && !state.creationError) {
				console.log('puzzle not initialized. cannot reset');
				return;
			}
			const timer = usePuzzleTimer();
			commit('reset');
			timer.reset();
			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.reset();
			usePuzzleHintsStore().reset();
			usePuzzleMistakesStore().reset();
		},
		restartPuzzle({ state, commit }) {
			const { deleteSavedPuzzle } = useSavedPuzzle();
			deleteSavedPuzzle();
			const { initialBoard, solution } = state;
			const board = initialBoard.copy();
			commit('setAllBoards', { board, solution, initialBoard });
			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.reset();
			usePuzzleHintsStore().reset();
			usePuzzleMistakesStore().reset();
			// TODO: reset timer as well?
		},

		startPuzzle({ state, commit }) {
			if (!state.initialized) throw new Error('Cannot start uninitialized game!');
			if (state.started) throw new Error('Cannot start a game that already has started !');

			commit('setStarted', true);
			const timer = usePuzzleTimer();
			timer.start();
			// commit('timer/start');
		},

		async savePuzzle({ state, dispatch }) {
			const timer = usePuzzleTimer();
			let timeElapsed = timer.timeElapsed;
			if (timer.running && !!timer.startTime) {
				timeElapsed += (Date.now() - timer.startTime);
			}
			const { initialBoard, board, solution, width, height, difficulty } = state;
			const puzzleHistory = usePuzzleHistoryStore();
			const moveList = await puzzleHistory.exportMoveHistory();

			const { savePuzzle } = useSavedPuzzle();
			savePuzzle({
				moveList, timeElapsed, initialBoard, board, solution, width, height, difficulty
			});
		},
		loadSavedPuzzle({ commit, dispatch }) {
			dispatch('reset');
			const { savedPuzzle: currentSaved } = useSavedPuzzle();
			const saveData = currentSaved.value;

			// import moveLi.jsst
			const { moveList } = saveData;
			const { width, height, difficulty } = saveData;
			commit('setPuzzleConfig', { width, height, difficulty });
			
			// set time elapsed
			const { timeElapsed } = saveData;
			const timer = usePuzzleTimer();
			timer.setInitialTimeElapsed(timeElapsed);
			// commit('timer/setInitialTimeElapsed', timeElapsed);
			// start timer?

			const { initialBoard, solution, board } = saveData;

			const initialBoard2 = SimpleBoard.fromString(initialBoard);
			const board2 = SimpleBoard.fromString(board);
			const solution2 = SimpleBoard.fromString(solution);
			commit('setAllBoards', { initialBoard: initialBoard2, board: board2, solution: solution2 });

			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.importMoveHistory(moveList)
			
			
			commit('setInitialized', true);

		},
	}

}

export default puzzleModule;