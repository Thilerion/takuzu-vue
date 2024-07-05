import type { BasicPuzzleConfig, BoardAndSolutionBoardStrings } from "@/lib/types.js";
import { defineStore } from "pinia";
import { ref } from "vue";
import { usePuzzleStore } from "./puzzle/store.js";

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
	) {
		const puzzleStore = usePuzzleStore();
		if (conf !== currentGameConfig.value) {
			currentGameConfig.value = JSON.parse(JSON.stringify(conf));
		}

		const { mode } = conf;
		switch (mode) {
			case 'historyReplay': {
				return puzzleStore.replayPuzzle({
					puzzleConfig: conf.puzzleConfig,
					boardStrings: conf.boardStrings
				})
			}
			case 'freePlay': {
				const { isAutoReplay, puzzleConfig } = conf;
				if (isAutoReplay) {
					return puzzleStore.replayRandomPuzzle(puzzleConfig);
				} else {
					return puzzleStore.initPuzzle(puzzleConfig);
				}
			}
			default: {
				const x: never = mode;
				throw new Error(`Unexpected game mode: ${x}`);
			}
		}
	}

	async function playWithSameGameConfig() {
		if (currentGameConfig.value == null) {
			throw new Error('Cannot play with same game config; no game config is set.');
		}
		if (currentGameConfig.value.mode === 'historyReplay') {
			console.warn('Should not be able to play again with historyReplay game mode.');
		}
		return playWithGameConfig(currentGameConfig.value);
	}

	return {
		puzzleRefreshKey,
		
		currentGameConfig,
		playWithGameConfig,
		playWithSameGameConfig,
	};
})