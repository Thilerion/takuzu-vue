<template>
	<teleport to="#overlay-container">
		<transition name="t-wrapper">
			<div
				class="fixed pointer-events-none inset-0 flex w-full h-full modal-wrapper items-center justify-center"
				v-if="shouldShow"
			>
				<transition name="t-blur">
					<div class="bg-blur backdrop-blur-sm z-0 absolute w-full h-full inset-0" v-if="showBackdrop"></div>
				</transition>

				<PuzzleRecapBanner
					:show="showBanner"
					:enter-duration="500"
					:leave-duration="400"
					@banner-after-enter="bannerAfterEnter"
					class="z-10"
				/>
				<transition name="t-backdrop">
					<div v-if="showBackdrop" class="backdrop inset-0 w-full h-full absolute z-0 opacity-90"></div>
				</transition>

				<div class="absolute w-full h-full inset-0 z-20 p-6 flex justify-center items-center">
					<PuzzleRecapModalTransition>
						<template v-if="showContent">
							<PuzzleRecapContent
								@exit-to="exitTo"
							/>
						</template>
					</PuzzleRecapModalTransition>
				</div>

			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import { useRecapStatsStore } from '@/stores/recap-stats.js';
import { toRef, computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { usePuzzleRecapModalActions } from './usePuzzleRecapModalAction.js';

const props = defineProps<{
	finished: boolean
}>()

const finished = toRef(props, 'finished');

const recapStatsStore = useRecapStatsStore();

const modalShown = toRef(recapStatsStore, 'modalShown');
const shouldShow = computed(() => {
	return finished.value && modalShown.value;
})

const showBanner = ref(false);
const showBackdrop = ref(false);
const showContent = ref(false);

watch(shouldShow, (value) => {
	if (value) {
		nextTick(() => showBanner.value = true);
	} else {
		showBanner.value = false;
		showBackdrop.value = false;
		showContent.value = false;
	}
}, { immediate: true });

onMounted(() => showBanner.value = true);

onBeforeUnmount(() => {
	clearTimeout(bannerAfterEnterTimeout!);
	bannerAfterEnterTimeout = null;
})

let bannerAfterEnterTimeout: ReturnType<typeof setTimeout> | null = null;
const bannerAfterEnter = () => {
	clearTimeout(bannerAfterEnterTimeout!);
	bannerAfterEnterTimeout = globalThis.setTimeout(() => {
		showBackdrop.value = true;
		showBanner.value = false;
		showContent.value = true;
	}, 300);
}

const { exitTo } = usePuzzleRecapModalActions();
</script>

<style scoped>
.t-wrapper-leave-active {
	transition: opacity .2s ease;
}
.t-wrapper-leave-to {
	opacity: 0;
}

.backdrop {
	background: linear-gradient(rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.8) 35%, rgba(0, 0, 0, 0.9) 45%, rgba(0, 0, 0, 0.9) 50%, rgba(0, 0, 0, 0.9) 55%, rgba(0, 0, 0, 0.8) 65%, rgba(0, 0, 0, 0.75) 100%);
}

.bg-blur {
	backdrop-filter: blur(4px) opacity(1);
}
.t-blur-enter-active {
	transition-delay: 100ms;
}
.t-blur-enter-from {
	backdrop-filter: blur(4px) opacity(0);
}

.t-backdrop-enter-active {
	transform: scaleY(0.01) scaleX(1);
	animation: unfoldIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
.t-backdrop-enter-from {
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
</style>