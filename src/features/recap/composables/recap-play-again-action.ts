import { useRoute, useRouter } from "vue-router";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { usePuzzleRecapStore } from "../store.js";
import { useMainStore } from "@/stores/main.js";

export const useRecapModalPlayAgainAction = () => {

	const route = useRoute();
	const router = useRouter();

	const getRouteMode = (): 'replay' | null => {
		const mode = route?.query?.mode;
		if (mode == null) return null;
		else if (mode === 'replay') return 'replay';
		else {
			console.log(`Unexpected mode in recap modal playAgainAction: ${mode}`);
			return null;
		}
	}

	const stripReplayModeFromRoute = () => {
		try {
			const name = route.name ?? undefined;
			const query = route.query;
			const { mode, ...otherQueries } = query;
			router.replace({
				name,
				query: otherQueries
			});
		} catch(e) {
			console.warn(e);
		}	
	}

	async function playAgainNewPuzzleAction(): Promise<void> {
		const puzzleRecapStore = usePuzzleRecapStore();
		const puzzleStore = usePuzzleStore();
		const mainStore = useMainStore();

		const { width, height, difficulty } = puzzleRecapStore.historyEntry!;

		puzzleStore.reset();
		await puzzleStore.initPuzzle({ width, height, difficulty });
	
		// this part reloads the PlayPuzzle view with the new puzzle data
		mainStore.puzzleKey += 1;
	}

	async function playAgainReplayAction(): Promise<void> {
		const puzzleRecapStore = usePuzzleRecapStore();
		const puzzleStore = usePuzzleStore();
		const mainStore = useMainStore();

		try {
			const { width, height, difficulty } = puzzleRecapStore.historyEntry!;
			puzzleStore.reset();
			const found = await puzzleStore.replayRandomPuzzle({ width, height, difficulty });
			if (!found) {
				throw new Error('No puzzle found for replay.');
			}
			mainStore.puzzleKey += 1;
		} catch(e) {
			console.warn(e);
			window.alert('Could not find another puzzle for replay. Will generate a new puzzle instead.');
			// Now strip the replay mode from the route, and try the "playAgainNewPuzzleAction" again, which should now init a new puzzle
			stripReplayModeFromRoute();
			return playAgainNewPuzzleAction();
		}
	}

	async function playAgainAction(): Promise<void> {
		const mode = getRouteMode();
		if (mode === 'replay') {
			// Tries to find a replayable puzzle and loads it. If none is found, the mode will be stripped and a new puzzle will be created.
			return playAgainReplayAction();
		} else {
			return playAgainNewPuzzleAction();
		}
	}

	return { playAgainAction };
}