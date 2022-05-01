import { useMainStore } from "@/stores/main";
import { usePuzzleStore } from "@/stores/puzzle";
import { useRecapStatsStore } from "@/stores/recap-stats"
import { useRoute, useRouter } from "vue-router";

export const usePuzzleRecapModalActions = () => {
	const hideModal = () => recapStatsStore.hideModal();
	const route = useRoute();
	const router = useRouter();
	const recapStatsStore = useRecapStatsStore();
	const puzzleStore = usePuzzleStore();
	const goBackToRoute = makeGoBackToRoute({ route, router });
	const mainStore = useMainStore();

	async function playAgainAction() {
		const mode = route?.query?.mode;
		if (mode === 'replay') {
			// mode is stripped from route query if replay action fails
			return replayAction();
		}		
	
		const { width, height, difficulty } = recapStatsStore.lastPuzzleEntry;
		puzzleStore.reset();
		await puzzleStore.initPuzzle({ width, height, difficulty });
	
		// this part reloads the PlayPuzzle view with the new puzzle data
		mainStore.puzzleKey += 1;
	}
	
	const viewStatisticsAction = () => {
		return goBackToRoute('Statistics');
	}
	
	const viewHomeAction = () => {
		return goBackToRoute('Home');
	}
	
	const newPuzzleAction = () => {
		return goBackToRoute('NewPuzzleFreePlay');
	}
	
	const stripReplayModeFromRoute = () => {
		try {
			const name = route.name;
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
	
	async function replayAction() {
		try {
			const { width, height, difficulty } = recapStatsStore.lastPuzzleEntry;
			puzzleStore.reset();
			const found = await puzzleStore.replayRandomPuzzle({ width, height, difficulty });
			if (!found) {
				throw new Error('No puzzle found for replay.');
			}
			mainStore.puzzleKey += 1;
		} catch(e) {
			console.warn(e);
			window.alert('Could not find another puzzle for replay. Will generate a new puzzle instead.');
			stripReplayModeFromRoute();
			return playAgainAction();
		}
	} 
	
	function makeGoBackToRoute() {
		return (routeName, { replace = true } = {}) => {
			const routeMetaPrev = route?.meta?.prev;
			const prevName = routeMetaPrev?.name;
		
			if (prevName === routeName) {
				return router.go(-1);
			} else {
				if (replace) {
					return router.replace({ name: routeName });
				} else return router.push({ name: routeName });
			}
		}
	}

	async function exitTo(actionName) {
		console.log({ actionName });
		let actionFn = () => {};
		switch (actionName) {
			case 'play-again': {
				actionFn = () => playAgainAction();
				break;
			}
			case 'statistics': {
				actionFn = () => viewStatisticsAction();
				break;
			}
			case 'home': {
				actionFn = () => viewHomeAction();
				break;
			}
			case 'replay': {
				actionFn = () => replayAction();
				break;
			}
			case 'new-puzzle': {
				actionFn = () => newPuzzleAction();
				break;
			}
			default: {
				actionFn = () => { };
				break;
			}
		}

		try {
			await actionFn();
		} catch (e) {
			console.warn(`Recap modal action "${actionName}" failed.`);
			console.error(e);
			goBackToRoute('NewPuzzleFreePlay');
		} finally {
			hideModal();
		}
	}

	return { exitTo };
}
