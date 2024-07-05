import type { BasicPuzzleConfig, BoardAndSolutionBoardStrings } from "@/lib/types.js";
import { defineStore } from "pinia";
import { ref } from "vue";
import { usePuzzleStore } from "./puzzle/store.js";
import { useSavedPuzzle } from "@/services/savegame/useSavedGame.js";

export type GameMode = 'freePlay' | 'historyReplay';
export type CurrentGameConfig = {
	mode: 'historyReplay',
	boardStrings: BoardAndSolutionBoardStrings,
	puzzleConfig: BasicPuzzleConfig
} | {
	mode: 'freePlay',
	isAutoReplay: boolean,
	puzzleConfig: BasicPuzzleConfig
}

export const useGameStore = defineStore('game', () => {
	// Used to force rerendering of the play puzzle page when the board is changed (such as when the user "plays again" after finishing a puzzle)
	const puzzleRefreshKey = ref(0);

	const currentGameConfig = ref<CurrentGameConfig | null>(null);

	async function playWithGameConfig(
		conf: CurrentGameConfig
	): Promise<boolean> {
		const puzzleStore = usePuzzleStore();
		if (conf !== currentGameConfig.value) {
			currentGameConfig.value = JSON.parse(JSON.stringify(conf));
		}

		puzzleStore.reset();

		const { mode } = conf;
		switch (mode) {
			case 'historyReplay': {
				await puzzleStore.replayPuzzle({
					puzzleConfig: conf.puzzleConfig,
					boardStrings: conf.boardStrings
				})
				return true;
			}
			case 'freePlay': {
				const { isAutoReplay, puzzleConfig } = conf;
				if (isAutoReplay) {
					const res = await puzzleStore.replayRandomPuzzle(puzzleConfig);
					return res;
				} else {
					await puzzleStore.initPuzzle(puzzleConfig);
					return true;
				}
			}
			default: {
				const x: never = mode;
				throw new Error(`Unexpected game mode: ${x}`);
			}
		}
	}

	async function playAgainSameGameConfig(): Promise<boolean> {
		if (currentGameConfig.value == null) {
			throw new Error('Cannot play with same game config; no game config is set.');
		}
		const { mode } = currentGameConfig.value;
		if (mode === 'historyReplay') {
			console.warn('Should not be able to play again with historyReplay game mode.');
		}

		if (mode === 'historyReplay' || (mode === 'freePlay' && !currentGameConfig.value.isAutoReplay)) {
			return playWithGameConfig(currentGameConfig.value);
		}

		// Here: freePlay mode, and isAutoReplay is true. Try "replayRandomPuzzle", but if it fails, try initPuzzle instead
		try {
			const res = await playWithGameConfig(currentGameConfig.value);
			if (!res) {
				throw new Error('Error while tryig to play again with same config.');
			}
			return res;
		} catch(e) {
			console.warn(e);
			console.log('trying again without isAutoReplay');
			return playWithGameConfig({
				...currentGameConfig.value,
				isAutoReplay: false
			})
		}		
	}

	async function playFromSaveGame() {
		const puzzleStore = usePuzzleStore();
		puzzleStore.reset();
		const { getParsedSavedPuzzle } = useSavedPuzzle();
		const saveData = getParsedSavedPuzzle();
		if (saveData == null) {
			throw new Error('No saved puzzle found!');
		}
		currentGameConfig.value = saveData.gameConfig;

		puzzleStore.loadSavedPuzzle(saveData);
	}

	return {
		puzzleRefreshKey,
		
		currentGameConfig,

		playWithGameConfig,
		playAgainSameGameConfig,
		playFromSaveGame,
	};
})