<template>
<teleport to="#overlay-container">
	<transition name="t-wrapper">
		<div
			v-if="shouldShow"
			class="fixed pointer-events-none inset-0 flex w-full h-full modal-wrapper items-center justify-center"
		>
			<transition name="t-blur">
				<div
					v-if="showBackdrop"
					class="bg-blur backdrop-blur-sm z-0 absolute w-full h-full inset-0"
				></div>
			</transition>

			<PuzzleRecapBanner
				:show="showBanner"
				:enter-duration="500"
				:leave-duration="400"
				class="z-10"
				@banner-after-enter="bannerAfterEnter"
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
import { usePuzzleRecapModalActions } from './usePuzzleRecapModalAction.js';
import { usePuzzleRecapTransitionTimings } from './usePuzzleRecapTransitionTimings.js';
import { toRef } from 'vue';

const props = defineProps<{
	show: boolean
}>();
const shouldShow = toRef(props, 'show');

const {
	showBanner, showBackdrop, showContent,
	bannerAfterEnter
} = usePuzzleRecapTransitionTimings({
	enabled: shouldShow
});

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