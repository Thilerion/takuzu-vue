<template>
	<teleport to="#overlay-container">
	<PuzzleRecapWrapper
		class="pointer-events-none"
		:show="shouldShow"
	>
		<!-- <template #banner>
			Hi!
		</template> -->
		<template #content>
			<PuzzleRecapContent
				@exit-to="exitTo"
			
			></PuzzleRecapContent>
		</template>
	</PuzzleRecapWrapper>
	</teleport>
</template>

<script setup>
import PuzzleRecapWrapper from './PuzzleRecapWrapper.vue';
import { useRoute, useRouter } from 'vue-router';
import { computed, onUnmounted, ref, toRef, watch } from 'vue';
import { useRecapStatsStore } from '@/stores/recap-stats';
import { usePuzzleStore } from '@/stores/puzzle';
import { useMainStore } from '@/stores/main';
import { usePuzzleRecapModalActions } from './usePuzzleRecapModalAction';
import PuzzleRecapContent from './content/PuzzleRecapContent.vue';

const props = defineProps({
	finished: Boolean
})

const finished = toRef(props, 'finished');

const recapStatsStore = useRecapStatsStore();
const puzzleStore = usePuzzleStore();
const route = useRoute();
const router = useRouter();

const modalShown = toRef(recapStatsStore, 'modalShown');
const shouldShow = computed(() => {
	return finished.value && modalShown.value;
})

const noop = () => {};
const unmountAction = ref(noop);

const doUnmountAction = () => {
	unmountAction.value?.();
	unmountAction.value = noop;
}

const hideModal = () => {
	recapStatsStore.hideModal();
	doUnmountAction();
}

const { exitTo } = usePuzzleRecapModalActions();

const playAgainAction = async () => {
	try {
		const { width, height, difficulty } = recapStatsStore.lastPuzzleEntry;
		puzzleStore.reset();
		await puzzleStore.initPuzzle({
			width, height, difficulty
		});
		const mainStore = useMainStore();
		mainStore.puzzleKey += 1;
	} catch(e) {
		console.warn('Error while trying to create new puzzle in PlayAgain');
		throw e;
	}
}

const replayAction = async () => {
	try {
		const { width, height, difficulty } = recapStatsStore.lastPuzzleEntry;
		puzzleStore.reset();
		const found = await puzzleStore.replayRandomPuzzle({ width, height, difficulty });
		if (!found) {
			throw new Error('No puzzle found for replay.');
		}
		console.log('Replaying a different puzzle now.');
		const mainStore = useMainStore();
		mainStore.puzzleKey += 1;
	} catch(e) {
		console.warn(e);
		window.alert('Could not find another puzzle for replay. Will generate a new puzzle instead.');
		stripReplayModeFromRoute();
		return playAgainAction();
	}
}

function exitToOLD(destination) {
	const routeMetaPrev = route.meta.prev ?? {};
	switch(destination) {
		case 'new-game': {
			if (routeMetaPrev?.name === 'NewPuzzleFreePlay') {
				unmountAction.value = () => router.go(-1);
			} else {
				unmountAction.value = () => router.replace({ name: 'NewPuzzleFreePlay'});
			}
			break;
		}
		case 'home': {
			unmountAction.value = () => router.replace({ name: 'Home'});
			break;
		}
		case 'statistics': {
			if (routeMetaPrev?.name === 'PuzzleHistory') {
				unmountAction.value = () => router.go(-1);
			} else {
				unmountAction.value = () => router.replace({ name: 'Statistics'});
			}
			break;
		}
		case 'play-again': {
			unmountAction.value = noop;
			const mode = route?.query?.mode;
			let action;
			if (mode === 'replay') {
				action = replayAction;
			} else {
				action = playAgainAction;
			}
			action().catch(err => {
				console.log('Routing to new game screen because PlayAgain create-new-board failed');
				console.error(err);
				router.go(-1);
			}).finally(() => {
				hideModal();
			})
			return;
		}
		default: {
			console.log('No destination after leaving puzzleFinishedModal');
			unmountAction.value = noop;
			break;
		}
	}

	hideModal();
}
</script>

<style scoped>

</style>