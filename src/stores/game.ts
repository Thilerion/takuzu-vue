import type { AllPuzzleBoards, BasicPuzzleConfig, BoardShape, DifficultyKey } from "@/lib/types.js";
import { defineStore } from "pinia";
import { ref } from "vue";
import { usePuzzleStore } from "./puzzle/store.js";
import { useSavedPuzzle } from "@/services/savegame/useSavedGame.js";
import { SimpleBoard } from "@/lib/board/Board.js";
import type { StatsDbHistoryEntry } from "@/services/db/stats-db/models.js";
import { fetchAndPreparePuzzle, fetchRandomReplayablePuzzle } from "@/services/fetch-puzzle.js";
import { usePuzzleStatusStore } from "./puzzle/status-store.js";
import { isDifficultyRange, type DifficultyRange } from "@/features/puzzle-setup/composables/puzzle-setup-state.js";
import { getDifficultiesFromDifficultyRange, getPresetFromBoardShape } from "@/features/puzzle-setup/helpers/board-presets.js";
import { BoardPreset, isDifficultyKey } from "@/config.js";
import { pickRandom, pickRandomWeighted, type WeightedArrayItem } from "@/utils/random.utils.js";

export type GameMode = 'freePlay' | 'historyReplay';

export type HistoryReplaySetupConfig = {
	size: BoardShape,
	difficulty: DifficultyKey,
}
export type PuzzleSetupConfig = {
	size: BoardShape | BoardShape[],
	difficulty: DifficultyKey | DifficultyRange,
	options: {
		pickSizeWithEqualWeights: boolean,
	}
}
export type CurrentGameConfig = {
	mode: 'historyReplay',
	puzzleConfig: HistoryReplaySetupConfig
} | {
	mode: 'freePlay',
	isAutoReplay: boolean,
	puzzleConfig: PuzzleSetupConfig,
}
type PlayablePuzzle = AllPuzzleBoards & Pick<BasicPuzzleConfig, 'difficulty'>;

const getDefaultGameConfigFromPuzzleConfig = (conf: PuzzleSetupConfig): CurrentGameConfig => ({
	mode: 'freePlay',
	puzzleConfig: {...conf},
	isAutoReplay: false,
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
	function setCurrentGameConfigToDefault(conf: BasicPuzzleConfig | PuzzleSetupConfig) {
		if (!('size' in conf)) {
			setCurrentGameConfig(getDefaultGameConfigFromPuzzleConfig({
				size: { width: conf.width, height: conf.height },
				difficulty: conf.difficulty,
				options: {
					pickSizeWithEqualWeights: false,
				}
			}));
		} else {
			setCurrentGameConfig(getDefaultGameConfigFromPuzzleConfig(conf));
		}
	}
	
	/** Generates and sets a new puzzle based on the provided configuration */
	async function playNewPuzzle(puzzleConfig: PuzzleSetupConfig) {
		const puzzleStore = usePuzzleStore();
		try {
			setCurrentGameConfig({
				mode: 'freePlay',
				puzzleConfig,
				isAutoReplay: false
			})
			puzzleStore.reset();
			statusStore.loading = true;
			const basicConfig = selectPuzzleConfigFromSetupConfig(puzzleConfig);
			const puzzleBoards = await fetchAndPreparePuzzle(basicConfig);
			playPuzzle({ ...puzzleBoards, difficulty: basicConfig.difficulty });
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
	async function playPuzzleWithAutoReplay(puzzleConfig?: PuzzleSetupConfig) {
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
			const basicConfig = selectPuzzleConfigFromSetupConfig(puzzleConfig);
			puzzleStore.reset();
			statusStore.loading = true;
			const fetchedRandomPuzzle = await fetchRandomReplayablePuzzle(basicConfig);
			if (fetchedRandomPuzzle == null) {
				throw new Error('No replayable puzzle found.');
			}
			const board = SimpleBoard.import(fetchedRandomPuzzle.board);
			const solution = SimpleBoard.import(fetchedRandomPuzzle.solution);
			const initialBoard = board.copy();
			return playPuzzle({
				difficulty: basicConfig.difficulty,
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
				size: { width: historyEntry.width, height: historyEntry.height },
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

function selectPuzzleConfigFromSetupConfig(conf: PuzzleSetupConfig): BasicPuzzleConfig {
	const preset = getPresetFromConfSize(conf.size, conf.options);
	if (Array.isArray(conf.size)) {
		console.log(`Selected preset (${preset.width}x${preset.height}) from config size.`, JSON.parse(JSON.stringify(conf.size)));
	}
	const difficulty = getDifficultyFromConfAndPreset(conf, preset);
	if (Array.isArray(conf.difficulty)) {
		console.log(`Selected difficulty (${difficulty}) from config difficulty.`, JSON.parse(JSON.stringify(conf.difficulty)));
	}
	return { width: preset.width, height: preset.height, difficulty };
}

function pickRandomPresetFromBoardShapes(sizes: BoardShape[], opts: { weightByNumCells: boolean }): BoardPreset | null {
	const { weightByNumCells } = opts;
	if (weightByNumCells) {
		// TODO: improve this mess of calculating weights
		const withWeights = sizes.map(size => {
			const base = Math.max(Math.sqrt(size.width * size.height) - 4, 1);
			const weight = Math.round(1 / base * 100);
			return [size, weight] as WeightedArrayItem<BoardShape>;
		});
		console.log(withWeights);
		const randomSize = pickRandomWeighted(withWeights);
		return getPresetFromBoardShape(randomSize);
	}

	const randomSize = pickRandom(sizes);
	return getPresetFromBoardShape(randomSize);
}

function pickRandomDifficultyFromRange(range: DifficultyRange, selectedPreset: BoardPreset): DifficultyKey {
	const maxDifficulty = Math.min(selectedPreset.maxDifficulty, range[1]);
	if (!isDifficultyKey(maxDifficulty)) {
		throw new Error('Math.min with two difficulty keys returned a non-difficulty key.');
	}
	const minDifficulty = range[0];
	if (minDifficulty > maxDifficulty) {
		throw new Error(`Invalid difficulty range for size ${selectedPreset.width}x${selectedPreset.height}: min is higher than max.`);
	}
	const newRange: DifficultyRange = [minDifficulty, maxDifficulty];
	const difficultyList = getDifficultiesFromDifficultyRange(newRange);
	return pickRandom(difficultyList);
}

function getPresetFromConfSize(size: BoardShape | BoardShape[], opts?: { pickSizeWithEqualWeights: boolean }): BoardPreset {
	if (Array.isArray(size)) {
		const useSizeEqualWeights = opts?.pickSizeWithEqualWeights ?? false;
		const weightByNumCells = !useSizeEqualWeights;
		console.log(`Selecting random preset from config size, with option weightByNumCells: ${weightByNumCells}`);
		const preset = pickRandomPresetFromBoardShapes(size, { weightByNumCells });
		if (preset == null) {
			throw new Error(`No preset found for list of sizes.`);
		}
		return preset;
	} else {
		const preset = getPresetFromBoardShape(size);
		if (preset == null) {
			throw new Error(`No preset found for size ${size.width}x${size.height}`);
		}
		return preset;
	}
}
function getDifficultyFromConfAndPreset(conf: Pick<PuzzleSetupConfig, 'difficulty'>, preset: BoardPreset): DifficultyKey {
	if (!isDifficultyRange(conf.difficulty)) {
		const difficulty: DifficultyKey = conf.difficulty;
		if (preset.maxDifficulty < difficulty) {
			throw new Error(`Preset ${preset.width}x${preset.height} does not allow difficulty ${difficulty}.`);
		}
		return difficulty;
	} else {
		return pickRandomDifficultyFromRange(conf.difficulty, preset);
	}
}