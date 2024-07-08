import type { AllPuzzleBoards, BasicPuzzleConfig } from "@/lib/types.js";
import { defineStore } from "pinia";
import { ref } from "vue";
import { usePuzzleStore } from "./puzzle/store.js";
import { useSavedPuzzle } from "@/services/savegame/useSavedGame.js";
import { SimpleBoard } from "@/lib/board/Board.js";
import type { StatsDbHistoryEntry } from "@/services/db/stats-db/models.js";
import { fetchAndPreparePuzzle, fetchRandomReplayablePuzzle } from "@/services/fetch-puzzle.js";
import { usePuzzleStatusStore } from "./puzzle/status-store.js";

export type GameMode = 'freePlay' | 'historyReplay';
export type CurrentGameConfig = {
	mode: 'historyReplay',
	puzzleConfig: BasicPuzzleConfig
} | {
	mode: 'freePlay',
	isAutoReplay: boolean,
	puzzleConfig: BasicPuzzleConfig
}
type PlayablePuzzle = AllPuzzleBoards & Pick<BasicPuzzleConfig, 'difficulty'>;

const getDefaultGameConfigFromPuzzleConfig = (conf: BasicPuzzleConfig): CurrentGameConfig => ({
	mode: 'freePlay',
	puzzleConfig: {...conf},
	isAutoReplay: false
})

export const useGameStore = defineStore('game', () => {
	// Used to force rerendering of the play puzzle page when the board is changed (such as when the user "plays again" after finishing a puzzle)
	const puzzleRefreshKey = ref(0);

	const currentGameConfig = ref<CurrentGameConfig | null>(null);

	const statusStore = usePuzzleStatusStore();

	/** Actually sets the puzzle, created or loaded by the other functions in this store. */
	function playPuzzle(puzzle: PlayablePuzzle) {
		// TODO: also handle a saved puzzle's state, which includes history, timeElapsed, used hints, etc
		// TODO: set correct status properties
		const { difficulty, board, solution, initialBoard } = puzzle;
		const puzzleStore = usePuzzleStore();
		puzzleStore.loadPuzzle({ difficulty, board, solution, initialBoard });
	}
	function setCurrentGameConfig(conf: CurrentGameConfig | null) {
		if (conf == null) {
			currentGameConfig.value = null;
			return;
		}
		currentGameConfig.value = JSON.parse(JSON.stringify(conf));
	}
	function setCurrentGameConfigToDefault(conf: BasicPuzzleConfig) {
		setCurrentGameConfig(getDefaultGameConfigFromPuzzleConfig(conf));
	}
	
	/** Generates and sets a new puzzle based on the provided configuration */
	async function playNewPuzzle(puzzleConfig: BasicPuzzleConfig) {
		const puzzleStore = usePuzzleStore();
		try {
			setCurrentGameConfig({
				mode: 'freePlay',
				puzzleConfig,
				isAutoReplay: false
			})
			puzzleStore.reset();
			statusStore.loading = true;
			const puzzleBoards = await fetchAndPreparePuzzle(puzzleConfig);
			playPuzzle({ ...puzzleBoards, difficulty: puzzleConfig.difficulty });
		} catch(e) {
			console.warn('Error while generating/initializing a newly generated puzzle.');
			console.warn(String(e));
			puzzleStore.reset();
			const msg = e instanceof Error ? e.message : 'An error occurred in "initPuzzle()"';
			statusStore.setInitializationError(true, msg);
			throw e;
		} finally {
			statusStore.loading = false;
		}
	}

	/** Replays a previously played puzzle, randomly chosen, based on the provided configuration */
	async function playPuzzleWithAutoReplay(puzzleConfig?: BasicPuzzleConfig) {
		const puzzleStore = usePuzzleStore();
		try {
			if (puzzleConfig == null) {
				if (currentGameConfig.value == null || currentGameConfig.value.mode !== 'freePlay') {
					throw new Error('Cannot play with auto-replay without an already set gameConfig.');
				}
				puzzleConfig = currentGameConfig.value.puzzleConfig;
			}
			setCurrentGameConfig({
				mode: 'freePlay',
				puzzleConfig,
				isAutoReplay: true,
			})
			puzzleStore.reset();
			statusStore.loading = true;
			const fetchedRandomPuzzle = await fetchRandomReplayablePuzzle(puzzleConfig);
			if (fetchedRandomPuzzle == null) {
				throw new Error('No replayable puzzle found.');
			}
			const board = SimpleBoard.import(fetchedRandomPuzzle.board);
			const solution = SimpleBoard.import(fetchedRandomPuzzle.solution);
			const initialBoard = board.copy();
			return playPuzzle({
				difficulty: puzzleConfig.difficulty,
				board, solution, initialBoard
			});
		} catch(e) {
			console.warn('Could not replay random puzzle.');
			puzzleStore.reset();
			const msg = e instanceof Error ? e.message : 'An unknown error occurred while trying to retrieve and set a random replayable puzzle.';
			statusStore.setInitializationError(true, msg);
			throw e;
		} finally {
			statusStore.loading = false;
		}
	}

	/** Replay the selected previously played puzzle from history. */
	async function playReplayPuzzleFromHistory(historyEntry: StatsDbHistoryEntry) {
		setCurrentGameConfig({
			mode: 'historyReplay',
			puzzleConfig: {
				difficulty: historyEntry.difficulty,
				width: historyEntry.width,
				height: historyEntry.height,
			}
		});
		const board = SimpleBoard.import(historyEntry.initialBoard);
		const solution = SimpleBoard.import(historyEntry.solution);
		const initialBoard = board.copy();
		return playPuzzle({
			difficulty: historyEntry.difficulty,
			board, solution, initialBoard
		});
	}

	/** Play/resume the current saved puzzle from localStorage. */
	async function playSavedPuzzle() {
		const puzzleStore = usePuzzleStore();
		puzzleStore.reset();
		const { getParsedSavedPuzzle } = useSavedPuzzle();
		const saveData = getParsedSavedPuzzle();
		if (saveData == null) {
			throw new Error('No saved puzzle found!');
		}
		if (saveData.gameConfig == null) {
			// Should not happen, maybe only in savegames from older versions
			setCurrentGameConfigToDefault(saveData.config);
		} else {
			setCurrentGameConfig(saveData.gameConfig);
		}
		return puzzleStore.loadSavedPuzzle(saveData);
	}

	async function playAgain() {
		if (currentGameConfig.value == null) {
			throw new Error('Cannot play with same game config; no game config is set.');
		}
		const { mode } = currentGameConfig.value;
		if (mode === 'freePlay') {
			const { isAutoReplay } = currentGameConfig.value;
			if (isAutoReplay) {
				return playPuzzleWithAutoReplay();
			} else {
				return playNewPuzzle(currentGameConfig.value.puzzleConfig);
			}
		} else {
			throw new Error(`Cannot play again with mode "${mode}".`);
		}
	}

	return {
		puzzleRefreshKey,
		
		currentGameConfig,

		playNewPuzzle,
		playPuzzleWithAutoReplay,
		playReplayPuzzleFromHistory,
		playSavedPuzzle,

		playAgain,
	};
})