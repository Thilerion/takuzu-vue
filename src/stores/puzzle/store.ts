import { defineStore } from "pinia";
// Services
import { useSavedPuzzle } from "@/services/savegame/useSavedGame";
import { fetchAndPreparePuzzle, fetchRandomReplayablePuzzle } from "@/services/fetch-puzzle.js";
import { useSharedPuzzleToggle } from "@/composables/use-puzzle-toggle";
import { getRandomPuzzleTransformationOnRestart } from "./useRandomPuzzleTransformation.js";
import type { FinishedPuzzleState } from "@/services/db/stats-db/models.js";
// Other stores
import { usePuzzleHintsStore } from "../hints/store.js";
import { usePuzzleTimer } from "./timer-store.js";
import { useRecapStatsStore } from "../recap-stats";
import { usePuzzleAssistanceStore } from "../assistance/store";
// Lib imports and misc.
import { SimpleBoard } from "@/lib";
import { EMPTY, ONE, ZERO, type PuzzleValue } from "@/lib/constants";
import { PuzzleTransformations } from "@/lib/transformations/PuzzleTransformations.js";
import type { BasicPuzzleConfig, BoardString, DifficultyKey, AllPuzzleBoards, VecValueChange, BoardAndSolutionBoardStrings, GridCounts, Vec } from "@/lib/types";
import type { TransformationKey } from "@/lib/transformations/types.js";
import type { PickOptional } from "@/types.js";
import { usePuzzleHistoryStore } from "../puzzle-history/history-store.js";
import type { IHistoryMove } from "../puzzle-history/models.js";

export type PuzzleStatus = 'none' | 'loading' | 'error_loading' | 'playing' | 'paused' | 'finished'; 
export type PuzzleStoreState = {
	width: number | null,
	height: number | null,
	difficulty: number | null | DifficultyKey, // TODO: use DifficultyKey instead of number

	initialBoard: SimpleBoard | null,
	board: SimpleBoard | null,
	solution: SimpleBoard | null,
	solutionBoardStr: BoardString | null,

	transformations: null | {
		previous: TransformationKey[],
		initialGridHandler: PuzzleTransformations,
		solutionHandler: PuzzleTransformations,
	},

	initialEmpty: number | null,

	gridCounts: GridCounts,

	cheatsUsed: boolean,

	initialized: boolean,
	started: boolean,
	finished: boolean,

	pausedManually: boolean,
	pausedAutomatically: boolean,

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

		initialEmpty: null,

		gridCounts: {
			[ZERO]: 0,
			[ONE]: 0,
			[EMPTY]: 0
		},

		// state for recap/puzzleHistory/stats
		cheatsUsed: false,

		// play/ui state
		initialized: false,
		started: false,
		finished: false,

		// new "paused" state
		pausedManually: false,
		pausedAutomatically: false,

		// game creation state/errors
		loading: false,
		creationError: false,
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
		paused: state => state.pausedManually || state.pausedAutomatically,
		status(): PuzzleStatus {
			if (!this.initialized) {
				if (this.loading) return 'loading';
				else if (this.creationError) return 'error_loading';
				else return 'none';
			}
			// is initialized
			if (this.finished) {
				return 'finished';
			} else if (this.paused) {
				return 'paused';
			} else if (this.board != null) {
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
		},
		setAllBoards({ board, solution, initialBoard }: AllPuzzleBoards) {
			this.board = board;
			this.solution = solution;
			this.initialBoard = initialBoard;
			this.solutionBoardStr = solution.toString();

			this.gridCounts = calculateGridCounts(board);
			this.initialEmpty = [...initialBoard.cells({ skipFilled: true })].length;
		},
		/** Refresh grid counts, after multiple changes to the board at once, instead of manually adding and subtracting after each change. */
		refreshCounts() {
			const gridCounts = calculateGridCounts(this.board!);
			this.$patch({ gridCounts });
		},
		reset() {
			if (this.board != null && !this.initialized && !!this.board && !this.creationError) {
				console.log('puzzle not initialized. cannot reset');
				return;
			}

			// reset all sub-stores
			usePuzzleTimer().reset();
			usePuzzleHistoryStore().reset();
			usePuzzleHintsStore().reset();
			usePuzzleAssistanceStore().reset();

			this.$reset();
		},
		_updateGridCount(value: PuzzleValue, prev: PuzzleValue) {
			this.gridCounts[value] += 1;
			this.gridCounts[prev] -= 1;
		},

		_setValue({ x, y, value, prevValue }: VecValueChange, updateCounts = true) {
			this.board!.assign(x, y, value);
			if (updateCounts) {
				this._updateGridCount(value, prevValue);
			}
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
			this.refreshCounts();
			usePuzzleAssistanceStore().resetMarkedMistakes();
		},
		setValue({ x, y, value, prevValue }: PickOptional<VecValueChange, 'prevValue'>) {
			if (!prevValue) {
				this._setValue({ x, y, value, prevValue: this.board!.grid[y][x] });
			} else this._setValue({ x, y, value, prevValue });

			usePuzzleAssistanceStore().removeFromMarkedMistakes({ x, y });
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
		toggle({ x, y, prevValue }: Vec & { prevValue?: PuzzleValue, value?: never }) {
			const previous = prevValue ?? this.board!.grid[y][x];

			const { toggle } = useSharedPuzzleToggle();
			const value = toggle(previous);

			this.makeMove({ x, y, value, prevValue: previous });
		},

		undoLastMove() {
			const puzzleHistory = usePuzzleHistoryStore();
			const move: IHistoryMove = { ...puzzleHistory.lastMove! };
			puzzleHistory.undoMove();
			const { x, y, prevValue: value, value: prevValue } = move;
			if (x == null || y == null || value == null) {
				console.warn('Could not undo move. No move to undo.');
				return;
			}
			this.setValue({ x, y, value, prevValue });
		},

		async createPuzzle({ width, height, difficulty }: BasicPuzzleConfig) {
			this.loading = true;
			try {
				const {
					board, solution, initialBoard
				} = await fetchAndPreparePuzzle({ width, height, difficulty });				
				this.setAllBoards({ board, solution, initialBoard });
			} finally {
				this.loading = false;
			}
			// catch error in caller, which also sets creationError property
		},
		async initPuzzle(puzzleConfig: BasicPuzzleConfig) {
			try {
				this.setPuzzleConfig(puzzleConfig);
				await this.createPuzzle(puzzleConfig);
				this.initialized = true;
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
		async replayRandomPuzzle(puzzleConfig: BasicPuzzleConfig): Promise<boolean> {			
			try {
				const fetchedRandomPuzzle = await fetchRandomReplayablePuzzle(puzzleConfig);
				if (fetchedRandomPuzzle == null) {
					return false;
				}
				await this.replayPuzzle({
					puzzleConfig,
					boardStrings: fetchedRandomPuzzle
				})
				return true;
			} catch (e) {
				console.warn('Could not replay random puzzle.');
				this.reset();
				this.setCreationError(true);
				throw e;
			}			
		},
		loadPuzzle({
			width, height, difficulty,
			board, solution, initialBoard = board.copy()
		}: BasicPuzzleConfig & PickOptional<AllPuzzleBoards, 'initialBoard'>) {
			this.reset();
			this.setPuzzleConfig({ width, height, difficulty });
			this.setAllBoards({ board, solution, initialBoard });
			this.initialized = true;
		},
		async finishPuzzle() {
			this.finished = true;
			const timer = usePuzzleTimer();
			timer.pause();

			const timeElapsed = timer.timeElapsed;
			// TODO: assistance from assistance store, with "checkData" etc
			const finishedPuzzleState: FinishedPuzzleState = {
				width: this.width!,
				height: this.height!,
				difficulty: this.difficulty as DifficultyKey,
				initialBoard: this.initialBoard!,
				solution: this.solution!,
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

			/* if (board.hasIncorrectValues(solution).hasMistakes) {
				throw new Error('The transformed puzzle has mistakes after restart, when compared to the transformed solution. This should not happen!');
			} else {
				 */this.setAllBoards({ board, solution, initialBoard });
			//}

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

			this.started = true;
			const timer = usePuzzleTimer();
			timer.start();
		},

		loadSavedPuzzle() {
			// TODO: a savedPuzzle should have the "replay mode" persisted
			this.reset();
			const { getParsedSavedPuzzle } = useSavedPuzzle();
			const saveData = getParsedSavedPuzzle();
			if (saveData == null) {
				throw new Error('No saved puzzle found!');
			}
			this.setPuzzleConfig(saveData.config);

			// set time elapsed
			const { timeElapsed } = saveData;
			const timer = usePuzzleTimer();
			timer.setInitialTimeElapsed(timeElapsed);

			this.setAllBoards(saveData.boards)

			const puzzleHistory = usePuzzleHistoryStore();
			puzzleHistory.importMoveHistory([...saveData.moveList]);

			this.initialized = true;
		},
	}
})

function calculateGridCounts(board: SimpleBoard): Record<PuzzleValue, number> {
	const counts = { [ONE]: 0, [ZERO]: 0, [EMPTY]: 0 };
	for (const cell of board.cells({ skipEmpty: false })) {
		counts[cell.value] += 1;
	}
	return counts;
}