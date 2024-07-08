import { useGameStore } from "@/stores/game.js";

export const useRecapModalPlayAgainAction = () => {
	const incrementPuzzleRefreshKey = () => {
		const gameStore = useGameStore();
		gameStore.puzzleRefreshKey += 1;
	}

	async function playAgainAction(): Promise<void> {
		const gameStore = useGameStore();
		if (gameStore.currentGameConfig == null) {
			throw new Error('Cannot play again; no game config is set.');
		}

		await gameStore.playAgain();
		// this part reloads the PlayPuzzle view with the new puzzle data
		incrementPuzzleRefreshKey();
	}

	return { playAgainAction };
}