import { defineStore } from "pinia";
// Services
import { useSavedPuzzle } from "@/services/savegame/useSavedGame";
import { fetchAndPreparePuzzle, fetchRandomReplayablePuzzle } from "@/services/fetch-puzzle.js";
import { useSharedPuzzleToggle } from "@/composables/use-puzzle-toggle";
import { getRandomPuzzleTransformationOnRestart } from "./useRandomPuzzleTransformation.js";
import { StatsDbHistoryEntry, type FinishedPuzzleState, type StatsDbHistoryEntryWithId } from "@/services/db/stats-db/models.js";
// Other stores
import { usePuzzleHintsStore } from "../hints/store.js";
import { usePuzzleTimer } from "./timer-store.js";
import { usePuzzleAssistanceStore } from "../assistance/store";
// Lib imports and misc.
import { SimpleBoard } from "@/lib";
import { EMPTY, ONE, ZERO, type PuzzleValue } from "@/lib/constants";
import { PuzzleTransformations } from "@/lib/transformations/PuzzleTransformations.js";
import type { BasicPuzzleConfig, BoardString, DifficultyKey, AllPuzzleBoards, VecValueChange, BoardAndSolutionBoardStrings, GridCounts, Vec, BoardShape } from "@/lib/types";
import type { TransformationKey } from "@/lib/transformations/types.js";
import type { PickOptional } from "@/types.js";
import { usePuzzleHistoryStore, type PostMoveHistoryAction } from "../puzzle-history/history-store.js";
import { usePuzzleRecapStore } from "../puzzle-recap.js";
import { useMainStore } from "../main.js";
import { statsDb } from "@/services/db/stats-db/init.js";

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
export type AssignToBoardOpts = {
	// how to handle updated grid counts: single updates it for every changed cell, refresh recalculates it from scratch (is better for large updates at once), none does not touch it
	handleGridCounts: "single" | "refresh" | "none",
	// how to handle marked mistakes: "remove" will remove a marked mistake for each assignment, "reset" will completely reset it (better for large changes at once), "none" will not touch it
	handleMarkedMistakes: "remove" | "reset" | "none",
}
export type MakePuzzleMoveOpts = {
	historyCommitType: Exclude<PostMoveHistoryAction, 'commitCombined'>,
}
export type MakePuzzleMovesOpts = {
	historyCommitType: PostMoveHistoryAction,
}

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
		gridShape: (state): BoardShape => ({ width: state.width ?? 0, height: state.height ?? 0 }),

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
		},
		canRestart(): boolean {
			const canUndo = usePuzzleHistoryStore().canUndo;
			return canUndo && this.status === 'playing';
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

		/**
		 * Simply update the board with one or multiple changes, and update the grid counts.
		 * The most basic action that updates board values, and as such is the action to subscribe to if you want to listen to specific changes being applied to the board.
		 */
		assignToBoard(changeOrChanges: VecValueChange | VecValueChange[], opts: AssignToBoardOpts = {
			handleGridCounts: "single",
			handleMarkedMistakes: "remove"
		}) {
			const {
				handleMarkedMistakes,
				handleGridCounts
			} = opts;

			const changes = Array.isArray(changeOrChanges) ? changeOrChanges : [changeOrChanges];
			const assistanceStore = usePuzzleAssistanceStore();

			for (const { x, y, value, prevValue } of changes) {
				this.board!.assign(x, y, value);
				if (handleGridCounts === "single") {
					this._updateGridCount(value, prevValue);
				}
				if (handleMarkedMistakes === "remove") {
					assistanceStore.removeFromMarkedMistakes({ x, y });
				}
			}
			if (handleGridCounts === 'refresh') {
				this.refreshCounts();
			}
			if (handleMarkedMistakes === 'reset') {
				assistanceStore.resetMarkedMistakes();
			}
		},

		makeMove(
			move: PickOptional<VecValueChange, 'prevValue'>,
			opts: MakePuzzleMoveOpts
		) {
			const {
				x, y, value,
				prevValue = this.board!.grid[y][x]
			} = move;
			if (prevValue === value) {
				console.log('Previous value is equal to current value. This move will not be committed.');
				return;
			}
			this.assignToBoard({ x, y, value, prevValue }, {
				handleGridCounts: "single",
				handleMarkedMistakes: "remove"
			});
			usePuzzleHistoryStore().applyHistoryAction([{ x, y, value, prevValue }], opts.historyCommitType);
		},


		// TODO: also allow for giving assignToBoardOpts
		makeMultipleMoves(moves: (PickOptional<VecValueChange, 'prevValue'>)[], opts: MakePuzzleMovesOpts) {
			const validatedMoves: VecValueChange[] = [];
			for (const m of moves) {
				const prev = m.prevValue ?? this.board!.grid[m.y][m.x];
				if (prev !== m.value) {
					validatedMoves.push({ ...m, prevValue: prev });
				}
			}

			if (validatedMoves.length === 0) {
				console.log('No valid moves to make. No moves will be committed.');
				return;
			}

			this.assignToBoard(validatedMoves);
			usePuzzleHistoryStore().applyHistoryAction(validatedMoves, opts.historyCommitType);
		},

		toggle({ x, y, prevValue }: Vec & { prevValue?: PuzzleValue, value?: never }) {
			const previous = prevValue ?? this.board!.grid[y][x];

			const { toggle } = useSharedPuzzleToggle();
			const value = toggle(previous);

			this.makeMove({ x, y, value, prevValue: previous }, { historyCommitType: "commit" });
		},

		undoLastMove() {
			const puzzleHistory = usePuzzleHistoryStore();
			if (!puzzleHistory.canUndo) {
				console.warn('Cannot undo; there are no moves to undo.');
				return;
			}
			const move = puzzleHistory.undoMove();

			if (Array.isArray(move)) {
				const reverseMoves = move.map(m => {
					const { x, y, from, to } = m.getReverse();
					return { x, y, value: to, prevValue: from };
				}).reverse();
				// remove (invalid) moves, where previous value (what is expected to be on the board now) is not consistent with what is actually on the board
				const validatedReverseMoves: VecValueChange[] = reverseMoves.filter(m => m.prevValue === this.board!.grid[m.y][m.x]);
				this.makeMultipleMoves(validatedReverseMoves, { historyCommitType: "skip" });
				return;
			}

			const { x, y, from, to } = move.getReverse(); // switch from and to because undoing === opposite move
			if (from !== this.board!.grid[y][x]) {
				console.error('This is an invalid undo move, as its prevValue is not consistent with what is actually on the board. Ignoring this one.');
				return;
			}
			// make move without committing to history; wouldn't want to add the undo to the history
			this.makeMove({
				x, y, value: to, prevValue: from
			}, { historyCommitType: "skip" });
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

			try {
				const historyEntry: StatsDbHistoryEntry | StatsDbHistoryEntryWithId = StatsDbHistoryEntry.fromPuzzleState(finishedPuzzleState);

				let shouldSaveToDb = true;

				if (finishedPuzzleState.assistance.cheatsUsed) {
					const savePuzzleToHistoryIfCheatedFlag = useMainStore().featureToggles.addPuzzleToHistoryWithCheats.isEnabled;
					if (!savePuzzleToHistoryIfCheatedFlag) {
						console.warn('Cheats used; will not save entry to history!');
						shouldSaveToDb = false;
					}
					// else: cheats were used, but will save to history anyway
				}

				// save to history database here, and update historyEntry with an id
				if (shouldSaveToDb) {
					const id = await statsDb.addEntry(historyEntry, true);
					const succesfullSave = id != null && typeof id === 'number';
					if (!succesfullSave) {
						console.error('Did not receive a correct id after saving history entry.');
						console.warn({ id });
					} else {
						if (historyEntry.id == null) {
							historyEntry.id = id;
						}
					}
				}

				// initialize recap stats store/game end stats
				const puzzleRecapStore = usePuzzleRecapStore();
				puzzleRecapStore.initialize(historyEntry);
				return true;

			} catch (e) {
				console.warn('Could not add finished puzzle to history, and could not initialize gameEndStats.');
				console.warn(e);
				return false;
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