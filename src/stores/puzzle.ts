import { useSharedPuzzleToggle } from "@/composables/use-puzzle-toggle";
import { SimpleBoard } from "@/lib";
import type { BasicPuzzleConfig, BoardString, DifficultyKey, AllPuzzleBoards, VecValueChange, BoardAndSolutionBoardStrings } from "@/lib/types";
import { EMPTY, ONE, ZERO, type PuzzleValue } from "@/lib/constants";
import { countLineValues, pickRandom } from "@/lib/utils";
import { requestPuzzle } from "@/services/create-puzzle";
import { useSavedPuzzle } from "@/services/savegame/useSavedGame";
import { initPregenPuzzles } from "@/workers/pregen-puzzles/interface.js";
import { defineStore } from "pinia";
import { usePuzzleHintsStore } from "./puzzle-hinter";
import { usePuzzleHistoryStore } from "./puzzle-history";
import { usePuzzleTimer } from "./puzzle-timer";
import { useRecapStatsStore } from "./recap-stats";
import { usePuzzleAssistanceStore } from "./assistance/store";
import { puzzleHistoryTable, type FinishedPuzzleState } from "@/services/db/stats-db/index.js";
import type { PickOptional } from "@/types.js";
import { PuzzleTransformations } from "@/lib/transformations/PuzzleTransformations.js";
import type { TransformationKey } from "@/lib/transformations/types.js";
import { getRandomPuzzleTransformationOnRestart } from "./composables/useRandomPuzzleTransformation.js";

export type PuzzleStatus = 'none' | 'loading' | 'error_loading' | 'playing' | 'paused' | 'finished'; 
export type PuzzleStoreState = {
	width: number | null,
	height: number | null,
	difficulty: number | null | DifficultyKey, // TODO: use DifficultyKey instead of number

	initialBoard: SimpleBoard | null,
	board: SimpleBoard | null,
	solution: SimpleBoard | null,
	solutionBoardStr: string | null,

	transformations: null | {
		previous: TransformationKey[],
		handler: PuzzleTransformations,
	},

	numCells: number | null,
	initialEmpty: number | null,

	rowCounts: Record<PuzzleValue, number>[],
	colCounts: Record<PuzzleValue, number>[],
	gridCounts: Record<PropertyKey, number>, // TODO: type gridCounts

	cheatsUsed: boolean,

	initialized: boolean,
	started: boolean,
	paused: boolean,
	pausedByUser: boolean,
	finished: boolean,

	loading: boolean,
	creationError: boolean
}
export type PuzzleStoreSetAction = PickOptional<VecValueChange, 'prevValue'>;

export const usePuzzleStore = defineStore('puzzleOld', {
	state: (): PuzzleStoreState => ({
		width: null,
		height: null,
		difficulty: null,

		initialBoard: null,
		board: null,
		solution: null,
		solutionBoardStr: null,

		transformations: null,

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
		boardStr: (state): BoardString | undefined => state.board?.toString(),
		boardFilled: state => state.gridCounts[EMPTY] === 0,

		hasStarted: state => state.started && state.initialized && state.board != null,
		finishedAndSolved(): boolean {
			if (!this.hasStarted || !this.boardFilled) return false;
			return this.solutionBoardStr === this.boardStr;
		},
		finishedWithMistakes(): boolean {
			if (!this.hasStarted || !this.boardFilled) return false;
			return this.solutionBoardStr !== this.boardStr;
		},
		progress: state => {
			const initialEmpty = state.initialEmpty!;
			const currentEmpty = state.gridCounts[EMPTY];
			const progress = 1 - (currentEmpty / initialEmpty);
			return progress;
		},

		status: (state): PuzzleStatus => {
			if (!state.initialized) {
				if (state.loading) return 'loading';
				else if (state.creationError) return 'error_loading';
				else return 'none';
			}
			// is initialized
			if (state.finished) {
				return 'finished';
			} else if (state.paused) {
				return 'paused';
			} else if (state.board != null) {
				return 'playing';
			}
			throw new Error('Unrecognized Puzzle status??!');
		}
	},

	actions: {
		// original mutations
		setLoading(val: boolean) {
			this.loading = val;
		},
		setCreationError(val: boolean) {
			this.creationError = val;
		},
		setPuzzleConfig({ width, height, difficulty }: BasicPuzzleConfig) {
			this.width = width;
			this.height = height;
			this.difficulty = difficulty;
			this.numCells = width * height;
		},
		setAllBoards({ board, solution, initialBoard }: AllPuzzleBoards) {
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
			const { rowCounts, colCounts } = calculateLineCounts(this.board!);
			this.$patch({ rowCounts, colCounts });
		},
		refreshGridCounts() {
			this.gridCounts = calculateGridCounts(this.board!);
		},
		reset() {
			if (this.board != null && !this.initialized && !!this.board && !this.creationError) {
				console.log('puzzle not initialized. cannot reset');
				return;
			}

			usePuzzleTimer().reset();
			usePuzzleHistoryStore().reset();
			usePuzzleHintsStore().reset();
			usePuzzleAssistanceStore().reset();

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
		setPaused(val: boolean, { userAction = false } = {}) {
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

		_updateGridCount(value: PuzzleValue, prev: PuzzleValue) {
			this.gridCounts[value] += 1;
			this.gridCounts[prev] -= 1;
		},
		_updateLineCount(x: number, y: number, value: PuzzleValue, prev: PuzzleValue) {
			this.rowCounts[y][value] += 1;
			this.rowCounts[y][prev] -= 1;
			this.colCounts[x][value] += 1;
			this.colCounts[x][prev] -= 1;
		},

		_setValue({ x, y, value, prevValue }: VecValueChange, updateCounts = true) {
			this.board!.assign(x, y, value);
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
		setMultipleValues(changeList: VecValueChange[] = []) {
			const moves = changeList.map(move => {
				const {
					x, y,
					value,
					prevValue = this.board!.grid[y][x]
				} = move;
				return { x, y, value, prevValue };
			})
			for (const move of moves) {
				this._setValue(move, false);
			}
			this.refreshLineCounts();
			this.refreshGridCounts();
			usePuzzleAssistanceStore().resetMarkedMistakes();
			const puzzleHintsStore = usePuzzleHintsStore();
			if (puzzleHintsStore.showHint) {
				usePuzzleHintsStore().hide();
			}
		},
		setValue({ x, y, value, prevValue }: PickOptional<VecValueChange, 'prevValue'>) {
			if (!prevValue) {
				this._setValue({ x, y, value, prevValue: this.board!.grid[y][x] });
			} else this._setValue({ x, y, value, prevValue });

			usePuzzleAssistanceStore().removeFromMarkedMistakes({ x, y });
			const puzzleHintsStore = usePuzzleHintsStore();
			if (puzzleHintsStore.showHint) {
				usePuzzleHintsStore().hide();
			}
		},
		makeMove({ x, y, value, prevValue }: PickOptional<VecValueChange, 'prevValue'>) {
			if (!prevValue) {
				prevValue = this.board!.grid[y][x];
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
		toggle({ x, y, value, prevValue }: PickOptional<VecValueChange, 'prevValue' | 'value'>) {
			const previous = prevValue ?? this.board!.grid[y][x];

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
			if (x == null || y == null || value == null) {
				console.warn('Could not undo move. No move to undo.');
				return;
			}
			this.setValue({ x, y, value, prevValue });
		},

		async createPuzzle({ width, height, difficulty }: BasicPuzzleConfig) {
			this.setLoading(true);

			try {
				const res = await requestPuzzle({ width, height, difficulty });
				const { success } = res;
				if (success) {
					const { data } = res;
					const { boardStr, solutionStr } = data;
					const board = SimpleBoard.import(boardStr);
					const solution = SimpleBoard.import(solutionStr);
					const initialBoard = board.copy();

					this.setAllBoards({ board, solution, initialBoard });
					this.setLoading(false);

					window.setTimeout(() => {
						initPregenPuzzles();
					}, 2000);
				} else {
					const { reason } = res;
					throw new Error(reason as any); // TODO: remove cast
				}
			} catch (e) {
				this.setLoading(false);
				throw e;
			}
		},
		async initPuzzle(puzzleConfig: BasicPuzzleConfig) {
			try {
				this.setPuzzleConfig(puzzleConfig);
				await this.createPuzzle(puzzleConfig);
				this.setInitialized(true);
			} catch (e) {
				this.reset();
				this.setCreationError(true);
				throw e;
			}
		},
		async replayPuzzle({
			puzzleConfig,
			boardStrings
		}: { puzzleConfig: BasicPuzzleConfig, boardStrings: BoardAndSolutionBoardStrings }) {
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
		}: BasicPuzzleConfig) {
			const previousPlays = await puzzleHistoryTable.where('[width+height+difficulty]').equals([width, height, difficulty]).toArray();
			if (!previousPlays.length) return false;

			const timestamp = Date.now();
			const second = 1000;
			const minute = 60 * second;
			const hour = 60 * minute;
			const fourHours = hour * 4;

			const recentlyPlayedBoards: string[] = previousPlays.filter((val: any) => {
				const timeDiff: number = timestamp - val.timestamp;
				if (timeDiff < fourHours) return true;
				return false;
			}).map((val: any): string => val.initialBoard);

			const initialBoards: string[] = previousPlays.map((val: any): string => val.initialBoard);
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

			const randomPuzzle = previousPlays.find((val: { initialBoard: string }) => val.initialBoard === randomBoard);
			if (randomPuzzle == null) {
				// TODO: is this check needed? when can it fail and why?
				throw new Error('Could not find random puzzle from previous plays.');
			}
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
		}: BasicPuzzleConfig & PickOptional<AllPuzzleBoards, 'initialBoard'>) {
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
			/* const checkData = {
				...usePuzzleAssistanceStore().checkAssistanceData
			}
			const hintAssistanceData = usePuzzleHintsStore().hintAssistanceData;
			const state = { ...this.$state }; */
			// const finishedPuzzleState: FinishedPuzzleState = {
			// 	...state, timeElapsed, assistance: {
			// 		// checkData,
			// 		// hintData: hintAssistanceData,
			// 		cheatsUsed: this.cheatsUsed
			// 	}
			// };
			const finishedPuzzleState: FinishedPuzzleState = {
				width: this.width as number,
				height: this.height as number,
				difficulty: this.difficulty as DifficultyKey,
				initialBoard: this.initialBoard as SimpleBoard,
				solution: this.solution as SimpleBoard,
				timeElapsed,
				assistance: {
					cheatsUsed: this.cheatsUsed
				}
			}

			const recapStatsStore = useRecapStatsStore();

			try {
				const historyEntry = await recapStatsStore.addFinishedPuzzleToHistory(finishedPuzzleState);
				return historyEntry;
			} catch (e) {
				console.warn('Could not add finished puzzle to history...');
				console.warn(e);
				return null;
			} finally {
				const { deleteSavedPuzzle } = useSavedPuzzle();
				deleteSavedPuzzle();
			}
		},

		restartPuzzle() {
			const { deleteSavedPuzzle } = useSavedPuzzle();
			deleteSavedPuzzle();

			const {	board, solution, initialBoard } = getRandomPuzzleTransformationOnRestart();

			this.setAllBoards({ board, solution, initialBoard });

			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.reset();
			usePuzzleHintsStore().reset();
			usePuzzleAssistanceStore().reset();
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
			if (saveData == null) {
				throw new Error('No saved puzzle found!');
			}
			// import moveList
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
			puzzleHistory.importMoveHistory([...moveList]);


			this.setInitialized(true);

		},
	}
})

// whenever the board object changes, recheck line counts
function calculateLineCounts(board: SimpleBoard): { rowCounts: Record<PuzzleValue, number>[], colCounts: Record<PuzzleValue, number>[] } {
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

function calculateGridCounts(board: SimpleBoard): Record<PuzzleValue, number> {
	const counts = { [ONE]: 0, [ZERO]: 0, [EMPTY]: 0 };
	for (const cell of board.cells({ skipEmpty: false })) {
		counts[cell.value] += 1;
	}
	return counts;
}