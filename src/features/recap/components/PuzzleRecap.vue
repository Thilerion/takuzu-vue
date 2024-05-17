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
					class="bg-blur z-0 absolute w-full h-full inset-0"
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
				<div v-if="showBackdrop" class="backdrop inset-0 w-full h-full absolute z-0"></div>
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
import { toRef } from 'vue';
import { usePuzzleRecapModalActions } from '@/features/recap/composables/usePuzzleRecapModalAction.js';
import { usePuzzleRecapTransitionTimings } from '@/features/recap/composables/usePuzzleRecapTransitionTimings.js';

const props = defineProps<{
	show: boolean
}>();
const shouldShow = toRef(props, 'show');

const {
	showBanner, showBackdrop, showContent,
	bannerAfterEnter,
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

[data-base-theme="light"] .backdrop {
	background: linear-gradient(rgba(0, 0, 0, 0.75) 5%, rgba(0, 0, 0, 0.8) 35%, rgba(0, 0, 0, 0.9) 45%, rgba(0, 0, 0, 0.9) 50%, rgba(0, 0, 0, 0.9) 55%, rgba(0, 0, 0, 0.8) 65%, rgba(0, 0, 0, 0.75) 100%);
	opacity: 0.9;
}
[data-base-theme="dark"] .backdrop {
	--clr-a: theme(colors.slate.600/50%);
	--clr-b: theme(colors.slate.900/80%);
	--clr-c: theme(colors.slate.950/90%);
	background: linear-gradient(var(--clr-a) 10%, var(--clr-b) 20%, var(--clr-c) 40%, var(--clr-c) 50%, var(--clr-c) 60%, var(--clr-b) 80%, var(--clr-a) 100%);
	opacity: 0.95;
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