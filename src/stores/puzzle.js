import { SimpleBoard } from "@/lib";
import { EMPTY, ONE, ZERO } from "@/lib/constants";
import { getRandomTransformation } from "@/lib/helpers/grid-transformations";
import { requestPuzzle } from "@/services/create-puzzle";
import { useSavedPuzzle } from "@/services/useSavedPuzzle";
import { calculateGridCounts, calculateLineCounts } from "@/store/puzzle/line-counts";
import { initPregenWorker } from "@/workers/pregen-puzzles";
import { defineStore } from "pinia";
import { unref } from "vue";
import { useBasicStatsStore } from "./basic-stats";
import { usePuzzleHintsStore } from "./puzzle-hinter";
import { usePuzzleHistoryStore } from "./puzzle-history";
import { usePuzzleMistakesStore } from "./puzzle-mistakes";
import { usePuzzleTimer } from "./puzzle-timer";
import { useSettingsStore } from "./settings";

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
		reset() {
			if (this.board != null && !this.initialized && !!this.board && !this.creationError) {
				console.log('puzzle not initialized. cannot reset');
				return;
			}

			const timer = usePuzzleTimer();
			timer.reset();
			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.reset();
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

		_setValue({ x, y, value, prevValue }) {
			this.board.assign(x, y, value);
			this._updateGridCount(value, prevValue);
			this._updateLineCount(x, y, value, prevValue);
		},

		// original actions
		pauseGame(value = true) {
			this.setPaused(value);
			const timer = usePuzzleTimer();
			if (value) {
				timer.pause();
			} else timer.resume();
		},
		setValue({ x, y, value, prevValue }) {
			if (!prevValue) {
				this._setValue({ x, y, value, prevValue: this.board.grid[y][x] });
			} else this._setValue({ x, y, value, prevValue });

			usePuzzleMistakesStore().removeFromCurrentMarkedCells(`${x},${y}`);
			usePuzzleHintsStore().showHint = false;
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
				const toggleMode = useSettingsStore().toggleMode;
				if (previous === EMPTY) {
					value = unref(toggleMode);
				} else if (previous === ZERO) {
					value = toggleMode === ZERO ? ONE : EMPTY;
				} else if (previous === ONE) {
					value = toggleMode === ZERO ? EMPTY : ZERO;
				}
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

					setTimeout(() => {
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
		async finishPuzzle() {
			this.setFinished(true);
			const timer = usePuzzleTimer();
			timer.pause();

			let timeElapsed = timer.timeElapsed;
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

		restartPuzzle() {
			const { deleteSavedPuzzle } = useSavedPuzzle();
			deleteSavedPuzzle();

			const {
				board,
				solution
			} = getRandomTransformation({
				board: this.initialBoard.copy(),
				solution: this.solution.copy()
			})
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

		async savePuzzle() {
			const timer = usePuzzleTimer();
			let timeElapsed = timer.timeElapsed;
			if (timer.running && !!timer.startTime) {
				timeElapsed += (Date.now() - timer.startTime);
			}
			const { initialBoard, board, solution, width, height, difficulty } = this;
			const puzzleHistory = usePuzzleHistoryStore();
			const moveList = await puzzleHistory.exportMoveHistory();

			const { savePuzzle } = useSavedPuzzle();
			savePuzzle({
				moveList, timeElapsed, initialBoard, board, solution, width, height, difficulty
			});
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