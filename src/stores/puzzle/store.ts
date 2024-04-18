import { defineStore } from "pinia";
import { reactive, computed, toRefs } from "vue";
// Services and composables
import { useSavedPuzzle } from "@/services/savegame/useSavedGame";
import { fetchAndPreparePuzzle, fetchRandomReplayablePuzzle } from "@/services/fetch-puzzle.js";
import { useSharedPuzzleToggle } from "@/composables/use-puzzle-toggle";
import { getRandomPuzzleTransformationOnRestart } from "./useRandomPuzzleTransformation.js";
import { StatsDbHistoryEntry, type FinishedPuzzleState, type StatsDbHistoryEntryWithId } from "@/services/db/stats-db/models.js";
import { statsDb } from "@/services/db/stats-db/init.js";
// Puzzle substores
import { usePuzzleHintsStore } from "../hints/store.js";
import { usePuzzleTimer } from "./timer-store.js";
import { usePuzzleAssistanceStore } from "../assistance/store.js";
import { usePuzzleVisualCuesStore } from "../puzzle-visual-cues.js";
import { usePuzzleBookmarksStore } from "../bookmarks.js";
import { usePuzzleHistoryStore, type PostMoveHistoryAction } from "../puzzle-history/history-store.js";
// Other stores
import { usePuzzleRecapStore } from "../puzzle-recap.js";
import { useMainStore } from "../main.js";
// Lib imports and misc.
import { SimpleBoard } from "@/lib";
import { EMPTY, ONE, ZERO, type PuzzleValue } from "@/lib/constants";
import { PuzzleTransformations } from "@/lib/transformations/PuzzleTransformations.js";
import type { BasicPuzzleConfig, BoardString, DifficultyKey, AllPuzzleBoards, VecValueChange, BoardAndSolutionBoardStrings, GridCounts, Vec, BoardShape, BoardExportString } from "@/lib/types";
import type { TransformationKey } from "@/lib/transformations/types.js";
import type { PickOptional } from "@/types.js";

export type PuzzleStatus = 'none' | 'loading' | 'error_loading' | 'playing' | 'paused' | 'finished';
export type PuzzleStoreState = {
	width: number | null,
	height: number | null,
	difficulty: DifficultyKey | null,
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

export const usePuzzleStore = defineStore('puzzle', () => {
	const state = reactive<PuzzleStoreState>({
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
	});

	const gridShape = computed((): BoardShape => ({ width: state.width ?? 0, height: state.height ?? 0 }));
	const boardStr = computed((): BoardString | undefined => state.board?.toString());
	const boardExportStr = computed((): BoardExportString | undefined => state.board?.export());
	const boardFilled = computed((): boolean => state.gridCounts[EMPTY] === 0);
	const hasStarted = computed((): boolean => state.started && state.initialized && state.board != null);
	const finishedAndSolved = computed((): boolean => {
		if (!hasStarted.value || !boardFilled.value) return false;
		return state.solutionBoardStr === boardStr.value;
	});
	const finishedWithMistakes = computed((): boolean => {
		if (!hasStarted.value || !boardFilled.value) return false;
		return state.solutionBoardStr !== boardStr.value;
	});
	const progress = computed((): number => {
		if (state.initialEmpty == null) return -1;
		const initialEmpty = state.initialEmpty;
		const currentEmpty = state.gridCounts[EMPTY];
		const progress = 1 - (currentEmpty / initialEmpty);
		return progress;
	});
	const paused = computed((): boolean => state.pausedManually || state.pausedAutomatically);
	const status = computed((): PuzzleStatus => {
		if (!state.initialized) {
			if (state.loading) return 'loading';
			else if (state.creationError) return 'error_loading';
			else return 'none';
		}
		// is initialized
		if (state.finished) {
			return 'finished';
		} else if (paused.value) {
			return 'paused';
		} else if (state.board != null) {
			return 'playing';
		}
		throw new Error('Unrecognized Puzzle status??!');
	});
	const canRestart = computed((): boolean => {
		// Allow restarting only if status is "Playing". Then, there must be moves to be undone, or there must be progress in some way on the board.
		// The "progress" check was added because a part of move history can be lost, or something else added to the board without adding to move history.
		if (status.value !== 'playing') return false;
		return progress.value > 0 || usePuzzleHistoryStore().canUndo;
	});

	function setLoading(val: boolean) {
		state.loading = val;
	}

	function setCreationError(val: boolean) {
		state.creationError = val;
	}

	function setPuzzleConfig({ width, height, difficulty }: BasicPuzzleConfig) {
		state.width = width;
		state.height = height;
		state.difficulty = difficulty;
	}

	function setAllBoards({ board, solution, initialBoard }: AllPuzzleBoards) {
		state.board = board;
		state.solution = solution;
		state.initialBoard = initialBoard;
		state.solutionBoardStr = solution.toString();
		state.gridCounts = calculateGridCounts(board);
		state.initialEmpty = [...initialBoard.cells({ skipFilled: true })].length;
	}

	/** Refresh grid counts, after multiple changes to the board at once, instead of manually adding and subtracting after each change. */
	function refreshCounts() {
		const gridCounts = calculateGridCounts(state.board!);
		state.gridCounts = gridCounts;
	}

	function reset() {
		if (state.board != null && !state.initialized && !!state.board && !state.creationError) {
			console.log('puzzle not initialized. cannot reset');
			return;
		}
		resetSubStores();
		Object.assign(state, {
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
			cheatsUsed: false,
			initialized: false,
			started: false,
			finished: false,
			pausedManually: false,
			pausedAutomatically: false,
			loading: false,
			creationError: false,
		});
	}

	function resetSubStores() {
		// reset all sub-stores
		usePuzzleTimer().reset();
		usePuzzleHistoryStore().reset();
		usePuzzleHintsStore().reset();
		usePuzzleAssistanceStore().reset();
		usePuzzleVisualCuesStore().reset();
		usePuzzleBookmarksStore().reset();
	}

	function _updateGridCount(value: PuzzleValue, prev: PuzzleValue) {
		state.gridCounts[value] += 1;
		state.gridCounts[prev] -= 1;
	}

	/**
	 * Simply update the board with one or multiple changes, and update the grid counts.
	 * The most basic action that updates board values, and as such is the action to subscribe to if you want to listen to specific changes being applied to the board.
	 */
	function assignToBoard(changeOrChanges: VecValueChange | VecValueChange[], opts: AssignToBoardOpts = {
		handleGridCounts: "single",
		handleMarkedMistakes: "remove"
	}) {
		const {
			handleMarkedMistakes,
			handleGridCounts
		} = opts;
		const changes = Array.isArray(changeOrChanges) ? changeOrChanges : [changeOrChanges];
		const visualCuesStore = usePuzzleVisualCuesStore();
		for (const { x, y, value, prevValue } of changes) {
			state.board!.assign(x, y, value);
			if (handleGridCounts === "single") {
				_updateGridCount(value, prevValue);
			}
			if (handleMarkedMistakes === "remove") {
				visualCuesStore.removeCellMarkAtCell({ x, y });
			}
		}
		if (handleGridCounts === 'refresh') {
			refreshCounts();
		}
		if (handleMarkedMistakes === 'reset') {
			visualCuesStore.clearErrorMarks();
		}
	}

	function makeMove(
		move: PuzzleStoreSetAction,
		opts: MakePuzzleMoveOpts
	) {
		const {
			x, y, value,
			prevValue = state.board!.grid[y][x]
		} = move;
		if (prevValue === value) {
			console.log('Previous value is equal to current value. This move will not be committed.');
			return;
		}
		assignToBoard({ x, y, value, prevValue }, {
			handleGridCounts: "single",
			handleMarkedMistakes: "remove"
		});
		usePuzzleHistoryStore().applyHistoryAction([{ x, y, value, prevValue }], opts.historyCommitType);
	}

	// TODO: also allow for giving assignToBoardOpts
	function makeMultipleMoves(moves: PuzzleStoreSetAction[], opts: MakePuzzleMovesOpts) {
		const validatedMoves: VecValueChange[] = [];
		for (const m of moves) {
			const prev = m.prevValue ?? state.board!.grid[m.y][m.x];
			if (prev !== m.value) {
				validatedMoves.push({ ...m, prevValue: prev });
			}
		}
		if (validatedMoves.length === 0) {
			console.log('No valid moves to make. No moves will be committed.');
			return;
		}
		assignToBoard(validatedMoves);
		usePuzzleHistoryStore().applyHistoryAction(validatedMoves, opts.historyCommitType);
	}

	function toggle({ x, y, prevValue }: Vec & { prevValue?: PuzzleValue, value?: never }) {
		const previous = prevValue ?? state.board!.grid[y][x];
		const { toggle } = useSharedPuzzleToggle();
		const value = toggle(previous);
		makeMove({ x, y, value, prevValue: previous }, { historyCommitType: "commit" });
	}

	function undoLastMove() {
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
			const validatedReverseMoves: VecValueChange[] = reverseMoves.filter(m => m.prevValue === state.board!.grid[m.y][m.x]);
			makeMultipleMoves(validatedReverseMoves, { historyCommitType: "skip" });
			return;
		}
		const { x, y, from, to } = move.getReverse(); // switch from and to because undoing === opposite move
		if (from !== state.board!.grid[y][x]) {
			console.error('This is an invalid undo move, as its prevValue is not consistent with what is actually on the board. Ignoring this one.');
			return;
		}
		// make move without committing to history; wouldn't want to add the undo to the history
		makeMove({
			x, y, value: to, prevValue: from
		}, { historyCommitType: "skip" });
	}

	async function createPuzzle({ width, height, difficulty }: BasicPuzzleConfig) {
		setLoading(true);
		try {
			const {
				board, solution, initialBoard
			} = await fetchAndPreparePuzzle({ width, height, difficulty });			
			setAllBoards({ board, solution, initialBoard });
		} finally {
			setLoading(false);
		}
		// catch error in caller, which also sets creationError property
	}

	async function initPuzzle(puzzleConfig: BasicPuzzleConfig) {
		try {
			setPuzzleConfig(puzzleConfig);
			await createPuzzle(puzzleConfig);
			state.initialized = true;
		} catch (e) {
			reset();
			setCreationError(true);
			throw e;
		}
	}
	async function replayPuzzle({
		puzzleConfig,
		boardStrings
	}: { puzzleConfig: BasicPuzzleConfig, boardStrings: BoardAndSolutionBoardStrings }) {
		const board = SimpleBoard.import(boardStrings.board);
		const initialBoard = board.copy();
		const solution = SimpleBoard.import(boardStrings.solution);
		return loadPuzzle({
			...puzzleConfig,
			board, solution, initialBoard
		})
	}

	async function replayRandomPuzzle(puzzleConfig: BasicPuzzleConfig): Promise<boolean> {
		try {
			const fetchedRandomPuzzle = await fetchRandomReplayablePuzzle(puzzleConfig);
			if (fetchedRandomPuzzle == null) {
				return false;
			}
			await replayPuzzle({
				puzzleConfig,
				boardStrings: fetchedRandomPuzzle
			})
			return true;
		} catch (e) {
			console.warn('Could not replay random puzzle.');
			reset();
			setCreationError(true);
			throw e;
		}
	}

	function loadPuzzle({
		width, height, difficulty,
		board, solution, initialBoard = board.copy()
	}: BasicPuzzleConfig & PickOptional<AllPuzzleBoards, 'initialBoard'>) {
		reset();
		setPuzzleConfig({ width, height, difficulty });
		setAllBoards({ board, solution, initialBoard });
		state.initialized = true;
	}

	async function finishPuzzle() {
		state.finished = true;
		const timer = usePuzzleTimer();
		timer.pause();
		const timeElapsed = timer.timeElapsed;
		// TODO: assistance from assistance store, with "checkData" etc
		const finishedPuzzleState: FinishedPuzzleState = {
			width: state.width!,
			height: state.height!,
			difficulty: state.difficulty as DifficultyKey,
			initialBoard: state.initialBoard!,
			solution: state.solution!,
			timeElapsed,
			assistance: {
				cheatsUsed: state.cheatsUsed
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
	}

	function restartPuzzle() {
		const { deleteSavedPuzzle } = useSavedPuzzle();
		deleteSavedPuzzle();
		const { board, solution, initialBoard } = getRandomPuzzleTransformationOnRestart();
	/* if (board.hasIncorrectValues(solution).hasMistakes) {
		throw new Error('The transformed puzzle has mistakes after restart, when compared to the transformed solution. This should not happen!');
	} else {
		 */setAllBoards({ board, solution, initialBoard });
		//}
		resetSubStores();
		// additionally requires starting the timer again
		const timer = usePuzzleTimer();
		timer.start();
	}

	function startPuzzle() {
		if (!state.initialized) throw new Error('Cannot start uninitialized game!');
		if (state.started) throw new Error('Cannot start a game that already has started !');
		state.started = true;
		const timer = usePuzzleTimer();
		timer.start();
	}

	function loadSavedPuzzle() {
		// TODO: a savedPuzzle should have the "replay mode" persisted
		reset();
		const { getParsedSavedPuzzle } = useSavedPuzzle();
		const saveData = getParsedSavedPuzzle();
		if (saveData == null) {
			throw new Error('No saved puzzle found!');
		}
		setPuzzleConfig(saveData.config);
		// set time elapsed
		const { timeElapsed } = saveData;
		const timer = usePuzzleTimer();
		timer.setInitialTimeElapsed(timeElapsed);
		setAllBoards(saveData.boards)
		const puzzleHistory = usePuzzleHistoryStore();
		puzzleHistory.importMoveHistory([...saveData.moveList]);
		const bookmarksStore = usePuzzleBookmarksStore();
		bookmarksStore.importBookmarks(saveData.bookmarks);
		const hintsStore = usePuzzleHintsStore();
		hintsStore.importHintSaveData(saveData.hints);
		state.initialized = true;
	}

	function loadBookmarkedPuzzleState(board: SimpleBoard) {
		// compare current board to bookmarked board states, then batch assign all changes in 1 go
		// this way all dependent changes are made, such as refreshing grid counts, hiding hint, etc, while setting the board itself would be more problematic
		const changes: VecValueChange[] = [];
		const currentBoardCells = board!.cells({ skipEmpty: false, skipFilled: false });
		for (const cell of currentBoardCells) {
			const newState = board.get(cell.x, cell.y);
			if (cell.value !== newState) {
				changes.push({ x: cell.x, y: cell.y, value: newState, prevValue: cell.value });
			}
		}
		if (!changes.length) {
			console.warn('No changes to apply from bookmarked state.');
			return;
		}
		assignToBoard(changes, {
			handleGridCounts: 'refresh',
			handleMarkedMistakes: 'reset'
		});
		// clear puzzle history after loading bookmark/snapshot
		usePuzzleHistoryStore().applyHistoryAction(changes, 'reset');
	}

	return {
		// state
		...toRefs(state),
		// getters
		gridShape,
		boardStr,
		boardExportStr,
		boardFilled,
		hasStarted,
		finishedAndSolved,
		finishedWithMistakes,
		progress,
		paused,
		status,
		canRestart,
		// actions
		reset,
		assignToBoard,
		makeMove,
		makeMultipleMoves,
		toggle,
		undoLastMove,
		initPuzzle,
		replayPuzzle,
		replayRandomPuzzle,
		finishPuzzle,
		restartPuzzle,
		startPuzzle,
		loadSavedPuzzle,
		loadBookmarkedPuzzleState
	}
})

function calculateGridCounts(board: SimpleBoard): Record<PuzzleValue, number> {
	const counts = { [ONE]: 0, [ZERO]: 0, [EMPTY]: 0 };
	for (const cell of board.cells({ skipEmpty: false })) {
		counts[cell.value] += 1;
	}
	return counts;
}