<template>
	<transition name="finished-modal3" :duration="{enter: 500, leave: 200}" @after-enter="afterEnterOuter" @after-leave="afterLeaveOuter">
		<div class="modal-wrapper w-full h-full flex" v-show="transitionData.show">
			<transition name="finished-modal-inner" @after-enter="afterEnterInner">
				<div class="flex modal-expander backdrop" v-show="transitionData.transitionInner">
					<div class="inner-content" :class="{'animate-modal-content': transitionData.showContent}">
						<PuzzleRecap2
							v-if="showPuzzleRecapInner"
							:stats="gameEndStats"
							:last-puzzle="lastPuzzleEntry"
							@exit-to="exitTo"
						/>
					</div>
				</div>
			</transition>
			<transition name="fade-base">
			<div class="banner-container" v-show="!transitionData.fadeOutBase">
				<div class="banner" @click="emitClose">
					<div class="banner-text">{{goodJobString}}</div>
				</div>
			</div>
			</transition>
		</div>
	</transition>
</template>

<script setup>
import { useMainStore } from '@/stores/main.js';
import { usePuzzleStore } from '@/stores/puzzle.js';
import { useRecapStatsStore } from '@/stores/recap-stats';
import { storeToRefs } from 'pinia';
import { computed, nextTick, ref, toRef, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PuzzleRecap from './PuzzleRecap.vue';
import PuzzleRecap2 from './PuzzleRecap2.vue';


const props = defineProps({
	finished: Boolean
});

const recapStatsStore = useRecapStatsStore();
const { hideModal } = recapStatsStore;
const { lastPuzzleEntry, modalShown } = storeToRefs(recapStatsStore);
// TODO: delete this, was used by previous store version
const gameEndStats = ref({});

const puzzleStore = usePuzzleStore();
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

// transition variables
const EXPAND_DURATION = 550;
const transitionData = reactive({
	fadeOutBase: false,
	showContent: false,
	afterEnterOuterTimeout: null,
	show: false,
	transitionInner: false,
	afterLeaveAction: null,
});
const shouldShow = computed(() => props.finished && modalShown.value);

const afterEnterOuter = () => {
	transitionData.afterEnterOuterTimeout = setTimeout(() => {
		transitionData.transitionInner = true;
		transitionData.fadeOutBase = true;
		transitionData.afterEnterOuterTimeout = null;
	}, EXPAND_DURATION);
}
const reset = () => {
	clearTimeout(transitionData.afterEnterOuterTimeout);
	transitionData.afterEnterOuterTimeout = null;
	transitionData.transitionInner = false;
	transitionData.fadeOutBase = false;
	transitionData.showContent = false;
	transitionData.show = false;
}
const afterEnterInner = () => transitionData.showContent = true;
const afterLeaveOuter = () => {
	setTimeout(() => {
		try {
			reset();
			transitionData.afterLeaveAction?.();
		} catch {}
	}, 100);
}

const goodJobString = ref('PLACEHOLDER_GOOD_JOB_STRING');
const openModal = () => {
	reset();
	nextTick(() => {
		const idx = Math.floor(Math.random() * GOOD_JOB_STRINGS.length);
		goodJobString.value = GOOD_JOB_STRINGS[idx];
		transitionData.show = true;
	})
}
watch(shouldShow, (value, prev) => {
	if (value && !prev) {
		openModal();
	} else {
		transitionData.show = false;
	}
})

const router = useRouter();
const route = useRoute();
function exitTo(destination) {
	const routeMetaPrev = route.meta.prev ?? {};
	switch(destination) {
		case 'new-game': {
			transitionData.afterLeaveAction = () => router.go(-1);
			break;
		}
		case 'home': {
			transitionData.afterLeaveAction = () => router.replace({ name: 'Home'});
			break;
		}
		case 'statistics': {
			if (routeMetaPrev?.name === 'PuzzleHistory') {
				transitionData.afterLeaveAction = () => router.go(-1);
			} else {
				transitionData.afterLeaveAction = () => router.replace({ name: 'Statistics'});
			}
			break;
		}
		case 'play-again': {
			transitionData.afterLeaveAction = () => {};
			playAgainAction().catch(err => {
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
			transitionData.afterLeaveAction = () => {};
			break;
		}
	}

	hideModal();
}

const showPuzzleRecapInner = computed(() => {
	return modalShown.value && transitionData.transitionInner && recapStatsStore.initialized;
})
const showPuzzleRecapModal = computed(() => {
	return props.finished && modalShown.value;
})

</script>

<script>
const GOOD_JOB_STRINGS = [
	'Good job!',
	'Sensational!',
	'Wow!',
	'Terrific!',
	'Excellent!',
	'Outstanding!',
	'Sensational!',
	'Exceptional!',
	'Fantastic!',
	'Marvelous!',
	'Fabulous!',
	'Tremendous job!',
	'Superb!',
	'Way to go!',
	'Wonderful!',
	"Amazing!",
];

</script>

<style scoped>
.banner-container {
	@apply bg-black text-white w-full my-auto flex justify-center items-center relative py-1;
	box-shadow: rgba(0, 0, 0, 0.35) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
}
.banner {
	min-height: 2rem;
	@apply px-4 py-6;
}
.banner-text {
	@apply text-xl;
}
.backdrop {
	@apply h-full w-full text-white m-auto absolute p-6;
	background: linear-gradient(rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 35%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 1) 55%, rgba(0, 0, 0, 0.9) 65%, rgba(0, 0, 0, 0.8) 100%)
}

.finished-modal3-enter-active {
	transform: translateX(-100%);
  	animation: slideIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
.finished-modal3-enter-active .banner {
	opacity: 0;
  	animation: fadeInInner 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;	
}
.finished-modal3-enter-active .banner-container {	
	transition: box-shadow 0.5s ease;
}
.finished-modal3-enter-from .banner-container {
	box-shadow: rgba(0, 0, 0, 0) 0px 54px 55px, rgba(0, 0, 0, 0) 0px -12px 30px, rgba(0, 0, 0, 0) 0px 4px 6px, rgba(0, 0, 0, 0) 0px 12px 13px, rgba(0, 0, 0, 0) 0px -3px 5px;
}
.finished-modal3-leave-active {
	transition: opacity .2s ease;
}
.finished-modal3-leave-to {
	opacity: 0;
}
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes fadeInInner {
	0% {
		opacity: 0;		
	}
	20% {
		opacity: 0;
	}
	100% {
		opacity: 1;		
	}
}
@keyframes fadeOut {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}

.finished-modal-inner-enter-active {
	transform: scaleY(0.01) scaleX(1);
  	animation: unfoldIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
.finished-modal-inner-enter-from {
	transform: scaleY(0.01) scaleX(1);
}
@keyframes unfoldIn {
0% {
    transform: scaleY(0.005) scaleX(1);
  }
  100% {
    transform: scaleY(1) scaleX(1);
  }
}

.fade-base-leave-active {
	transition: opacity .2s ease .15s;
}
.fade-base-leave-to {
	opacity: 0;
}

.inner-content {
	@apply rounded-t-xl rounded-b-md overflow-hidden flex m-auto w-full;
	min-height: 8rem;
	opacity: 0;
}
.animate-modal-content {
	animation: modalPop .3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes modalPop {
	0% {
		opacity: 0;
		transform: scale(0.90);
	}
	100% {
		opacity: 1;
		transform: scale(1);
	}
}
</style>