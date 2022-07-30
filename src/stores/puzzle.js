import { useSharedPuzzleToggle } from "@/composables/use-puzzle-toggle";
import { SimpleBoard } from "@/lib";
import { EMPTY, ONE, ZERO } from "@/lib/constants";
import { getRandomTransformedPuzzle } from "@/lib/helpers/transform";
import { countLineValues, pickRandom } from "@/lib/utils";
import { requestPuzzle } from "@/services/create-puzzle";
import { puzzleHistoryTable } from "@/services/stats/db";
import { useSavedPuzzle } from "@/services/savegame/useSavedGame";
import { initPregenWorker } from "@/workers/pregen/index";
import { defineStore } from "pinia";
import { usePuzzleHintsStore } from "./puzzle-hinter";
import { usePuzzleHistoryStore } from "./puzzle-history";
import { usePuzzleMistakesStore } from "./puzzle-mistakes";
import { usePuzzleTimer } from "./puzzle-timer";
import { useRecapStatsStore } from "./recap-stats";

export const PUZZLE_STATUS = {
	'NONE': 'NONE',
	'LOADING': 'LOADING',
	'ERROR_LOADING': 'ERROR_LOADING',
	'INITIALIZED': 'INITIALIZED',
	'PLAYING': 'PLAYING',
	'PAUSED': 'PAUSED',
	'FINISHED': 'FINISHED'
}

export const usePuzzleStore = defineStore('puzzleOld', {
	state: () => ({
		width: null,
		height: null,
		difficulty: null,

		initialBoard: null,
		board: null,
		solution: null,
		solutionBoardStr: null,

		numCells: null,
		initialEmpty: null,

		rowCounts: [],
		colCounts: [],
		gridCounts: {},

		// state for recap/puzzleHistory/stats
		cheatsUsed: false,

		// play/ui state
		initialized: false,
		started: false,
		paused: false,
		pausedByUser: false,
		finished: false,

		// game creation state/errors
		loading: false,
		creationError: false
	}),

	getters: {
		boardStr: state => state.board?.toString(),
		boardFilled: state => state.gridCounts[EMPTY] === 0,

		hasStarted: state => state.started && state.initialized && state.board != null,
		finishedAndSolved() {
			if (!this.hasStarted || !this.boardFilled) return false;
			return this.solutionBoardStr === this.boardStr;
		},
		finishedWithMistakes() {
			if (!this.hasStarted || !this.boardFilled) return false;
			return this.solutionBoardStr !== this.boardStr;
		},
		progress: state => {
			const initialEmpty = state.initialEmpty;
			const currentEmpty = state.gridCounts[EMPTY];
			const progress = 1 - (currentEmpty / initialEmpty);
			return progress;
		},

		status: state => {
			if (!state.initialized) {
				if (state.loading) return PUZZLE_STATUS.LOADING;
				else if (state.creationError) return PUZZLE_STATUS.ERROR_LOADING;
				else return PUZZLE_STATUS.NONE;
			}
			// is initialized
			if (state.finished) {
				return PUZZLE_STATUS.FINISHED;
			} else if (state.paused) {
				return PUZZLE_STATUS.PAUSED;
			} else if (state.board != null) {
				return PUZZLE_STATUS.PLAYING;
			}
			throw new Error('Unrecognized Puzzle status??!');
		}
	},

	actions: {
		// original mutations
		setLoading(val) {
			this.loading = val;
		},
		setCreationError(val) {
			this.creationError = val;
		},
		setPuzzleConfig({ width, height, difficulty }) {
			this.width = width;
			this.height = height;
			this.difficulty = difficulty;
			this.numCells = width * height;
		},
		setAllBoards({ board, solution, initialBoard }) {
			this.board = board;
			this.solution = solution;
			this.initialBoard = initialBoard;
			this.solutionBoardStr = solution.toString();

			const { rowCounts, colCounts } = calculateLineCounts(board);
			this.rowCounts = rowCounts;
			this.colCounts = colCounts;

			this.gridCounts = calculateGridCounts(board);
			this.initialEmpty = [...initialBoard.cells({ skipFilled: true })].length;
		},
		refreshLineCounts() {
			const { rowCounts, colCounts } = calculateLineCounts(this.board);
			this.$patch({ rowCounts, colCounts });
		},
		refreshGridCounts() {
			this.gridCounts = calculateGridCounts(this.board);
		},
		reset() {
			if (this.board != null && !this.initialized && !!this.board && !this.creationError) {
				console.log('puzzle not initialized. cannot reset');
				return;
			}

			usePuzzleTimer().reset();
			usePuzzleHistoryStore().reset();
			usePuzzleHintsStore().reset();
			usePuzzleMistakesStore().reset();

			this.$reset();
		},
		setInitialized(val = true) {
			this.initialized = val;
		},
		setStarted(val = true) {
			this.started = val;
		},
		setFinished(val = true) {
			this.finished = val;
		},
		setPaused(val, { userAction = false } = {}) {
			if (userAction) {
				this.paused = val;
				this.pausedByUser = val;
			} else {
				this.paused = val;
				if (!val) {
					this.pausedByUser = false;
				}
			}
			if (val) {
				const hintStore = usePuzzleHintsStore();
				hintStore.hide();
			}

		},
		setCheatUsed() {
			this.cheatsUsed = true;
		},

		_updateGridCount(value, prev) {
			this.gridCounts[value] += 1;
			this.gridCounts[prev] -= 1;
		},
		_updateLineCount(x, y, value, prev) {
			this.rowCounts[y][value] += 1;
			this.rowCounts[y][prev] -= 1;
			this.colCounts[x][value] += 1;
			this.colCounts[x][prev] -= 1;
		},

		_setValue({ x, y, value, prevValue }, updateCounts = true) {
			this.board.assign(x, y, value);
			if (updateCounts) {
				this._updateGridCount(value, prevValue);
				this._updateLineCount(x, y, value, prevValue);
			}
		},

		// original actions
		pauseGame(value = true) {
			this.setPaused(value);
			const timer = usePuzzleTimer();
			if (value) {
				timer.pause();
			} else timer.resume();
		},
		setMultipleValues(changeList = []) {
			const moves = changeList.map(move => {
				const {
					x, y,
					value,
					prevValue = this.board.grid[y][x]
				} = move;
				return { x, y, value, prevValue };
			})
			for (const move of moves) {
				this._setValue(move, false);
			}
			this.refreshLineCounts();
			this.refreshGridCounts();
			usePuzzleMistakesStore().resetMarkedCells();
			const puzzleHintsStore = usePuzzleHintsStore();
			if (puzzleHintsStore.showHint) {
				usePuzzleHintsStore().hide();
			}
		},
		setValue({ x, y, value, prevValue }) {
			if (!prevValue) {
				this._setValue({ x, y, value, prevValue: this.board.grid[y][x] });
			} else this._setValue({ x, y, value, prevValue });

			usePuzzleMistakesStore().removeFromCurrentMarkedCells(`${x},${y}`);
			const puzzleHintsStore = usePuzzleHintsStore();
			if (puzzleHintsStore.showHint) {
				usePuzzleHintsStore().hide();
			}
		},
		makeMove({ x, y, value, prevValue }) {
			if (!prevValue) {
				prevValue = this.board.grid[y][x];
			}
			if (prevValue === value) {
				console.log('Previous value is equal to current value. This move will not be committed.');
				return;
			}
			this.setValue({ x, y, value, prevValue });
			usePuzzleHistoryStore().addMove({
				x, y, value: prevValue, nextValue: value
			})
		},
		toggle({ x, y, value, prevValue }) {
			const previous = prevValue ?? this.board.grid[y][x];

			if (value == null) {
				const { toggle } = useSharedPuzzleToggle();
				value = toggle(previous);
			}

			this.makeMove({ x, y, value, prevValue: previous });
		},

		undoLastMove() {
			const puzzleHistory = usePuzzleHistoryStore();
			const move = { ...puzzleHistory.lastMove };
			puzzleHistory.undoMove();
			const { x, y, prevValue: value, value: prevValue } = move;
			this.setValue({ x, y, value, prevValue });
		},

		async createPuzzle({ width, height, difficulty }) {
			this.setLoading(true);

			try {
				const { success, data, reason } = await requestPuzzle({ width, height, difficulty });
				if (success) {
					const { boardStr, solutionStr } = data;
					const board = SimpleBoard.import(boardStr);
					const solution = SimpleBoard.import(solutionStr);
					const initialBoard = board.copy();

					this.setAllBoards({ board, solution, initialBoard });
					this.setLoading(false);

					window.setTimeout(() => {
						initPregenWorker();
					}, 2000);
				} else {
					throw new Error(reason);
				}
			} catch (e) {
				this.setLoading(false);
				throw new Error(e);
			}
		},
		async initPuzzle(puzzleConfig = {}) {
			try {
				this.setPuzzleConfig(puzzleConfig);
				await this.createPuzzle(puzzleConfig);
				this.setInitialized(true);
			} catch (e) {
				this.reset();
				this.setCreationError(true);
				throw new Error(e);
			}
		},
		async replayPuzzle({
			puzzleConfig,
			boardStrings
		}) {
			const board = SimpleBoard.import(boardStrings.board);
			const initialBoard = board.copy();
			const solution = SimpleBoard.import(boardStrings.solution);
			return this.loadPuzzle({
				...puzzleConfig,
				board, solution, initialBoard
			})
		},
		async replayRandomPuzzle({
			width, height, difficulty
		}) {
			const previousPlays = await puzzleHistoryTable.where('[width+height+difficulty]').equals([width, height, difficulty]).toArray();
			if (!previousPlays.length) return false;

			const timestamp = Date.now();
			const second = 1000;
			const minute = 60 * second;
			const hour = 60 * minute;
			const fourHours = hour * 4;

			const recentlyPlayedBoards = previousPlays.filter(val => {
				const timeDiff = timestamp - val.timestamp;
				if (timeDiff < fourHours) return true;
				return false;
			}).map(val => val.initialBoard);

			const initialBoards = previousPlays.map(val => val.initialBoard);
			const uniquePreviousBoards = [
				...new Set(initialBoards)
			].filter(initialBoardStr => {
				// filter out all recently played boards
				return !recentlyPlayedBoards.includes(initialBoardStr)
			});

			if (!uniquePreviousBoards.length) {
				console.log('Found boards, but none that were not recently played.');
				return false;
			}

			const randomBoard = pickRandom(uniquePreviousBoards);

			const randomPuzzle = previousPlays.find(val => val.initialBoard === randomBoard);
			const boardStrings = {
				board: randomPuzzle.initialBoard,
				solution: randomPuzzle.solution
			}
			const puzzleConfig = { width, height, difficulty };
			await this.replayPuzzle({
				puzzleConfig,
				boardStrings
			})
			return true;
		},
		loadPuzzle({
			width, height, difficulty,
			board, solution, initialBoard = board.copy()
		}) {
			this.reset();
			this.setPuzzleConfig({ width, height, difficulty });
			this.setAllBoards({ board, solution, initialBoard });
			this.setInitialized(true);
		},
		async finishPuzzle() {
			this.setFinished(true);
			const timer = usePuzzleTimer();
			timer.pause();

			const timeElapsed = timer.timeElapsed;
			const checkAssistanceData = usePuzzleMistakesStore().checkAssistanceData;
			const hintAssistanceData = usePuzzleHintsStore().hintAssistanceData;
			const state = { ...this.$state };
			const finishedPuzzleState = {
				...state, timeElapsed, assistance: {
					checkData: checkAssistanceData,
					hintData: hintAssistanceData,
					cheatsUsed: this.cheatsUsed
				}
			};

			// console.log({ ...finishedPuzzleState });

			const recapStatsStore = useRecapStatsStore();

			try {
				const historyEntry = await recapStatsStore.addFinishedPuzzleToHistory(finishedPuzzleState);
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

		restartPuzzle() {
			const { deleteSavedPuzzle } = useSavedPuzzle();
			deleteSavedPuzzle();

			const transformResult = getRandomTransformedPuzzle({
				board: this.initialBoard.copy(),
				solution: this.solution.copy(),
			})
			const { board, solution } = transformResult;

			const initialBoard = board.copy();
			this.setAllBoards({ board, solution, initialBoard });

			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.reset();
			usePuzzleHintsStore().reset();
			usePuzzleMistakesStore().reset();
			const timer = usePuzzleTimer();
			timer.reset();
			timer.start();
		},

		startPuzzle() {
			if (!this.initialized) throw new Error('Cannot start uninitialized game!');
			if (this.started) throw new Error('Cannot start a game that already has started !');

			this.setStarted(true);
			const timer = usePuzzleTimer();
			timer.start();
		},

		loadSavedPuzzle() {
			this.reset();
			const { savedPuzzle: currentSaved } = useSavedPuzzle();
			const saveData = currentSaved.value;

			// import moveLi.jsst
			const { moveList } = saveData;
			const { width, height, difficulty } = saveData;
			this.setPuzzleConfig({ width, height, difficulty });

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
			this.setAllBoards({
				initialBoard: initialBoard2,
				board: board2,
				solution: solution2
			})

			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.importMoveHistory(moveList);


			this.setInitialized(true);

		},
	}
})

// whenever the board object changes, recheck line counts
function calculateLineCounts(board) {
	const rowCounts = board.grid.map(row => {
		return countLineValues(row);
	})
	const colCounts = [];
	for (let x = 0; x < board.width; x++) {
		const col = board.getColumn(x);
		const count = countLineValues(col);
		colCounts.push(count);
	}
	return { rowCounts, colCounts };
}

function calculateGridCounts(board) {
	const counts = { [ONE]: 0, [ZERO]: 0, [EMPTY]: 0 };
	for (const cell of board.cells({ skipEmpty: false })) {
		counts[cell.value] += 1;
	}
	return counts;
}