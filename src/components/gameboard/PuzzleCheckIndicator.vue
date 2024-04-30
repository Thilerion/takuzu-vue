<template>
<div class="pointer-events-none fixed inset-0 z-10 grid place-content-center w-screen h-vh">
	<div ref="correctEl" class="opacity-0 row-start-1 col-start-1 row-span-1 col-span-1 z-10 relative">
		<div class="check-icon-wrapper">
			<icon-ic-outline-check-circle class="text-green-600 dark:text-green-500 check-icon" />
		</div>
	</div>
	<div ref="incorrectEl" class="opacity-0 row-start-1 col-start-1 row-span-1 col-span-1 z-10 relative">
		<div class="check-icon-wrapper">
			<icon-ic-outline-cancel class="text-red-700 dark:text-red-600 check-icon" />
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { usePuzzleValidationStore } from "@/stores/assistance/validation.js";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";

const puzzleValidationStore = usePuzzleValidationStore();
const { lastValidation, userChecks: checkId } = storeToRefs(puzzleValidationStore);
const errorFound = computed(() => !!lastValidation.value.found);

const correctEl = ref<HTMLElement | null>(null);
const incorrectEl = ref<HTMLElement | null>(null);

const checkAnimKeyframes: Keyframe[] = [
		{ opacity: 0 },
		{ opacity: 0.8, offset: 0.12 },
		{ opacity: 0 }
	];
const checkAnimOptions: KeyframeAnimationOptions = {
	duration: 2000,
	iterations: 1,
	fill: 'forwards',
	easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
}

let correctElAnimation: Animation | null = null;
let incorrectElAnimation: Animation | null = null;

const animateCorrectEl = () => {
	const el = correctEl.value!;
	incorrectElAnimation?.cancel?.();
	if (correctElAnimation == null) {
		correctElAnimation = el.animate(checkAnimKeyframes, checkAnimOptions);
		correctElAnimation.persist();
	} else {
		correctElAnimation.cancel();
		correctElAnimation.play();
	}
}
const animateIncorrectEl = () => {
	const el = incorrectEl.value!;
	correctElAnimation?.cancel?.();
	if (incorrectElAnimation == null) {
		incorrectElAnimation = el.animate(checkAnimKeyframes, checkAnimOptions);
		incorrectElAnimation.persist();
	} else {
		incorrectElAnimation.cancel();
		incorrectElAnimation.play();
	}
}

watch(checkId, (value, prev) => {
	if (value <= prev) {
		return;
	}
	if (!errorFound.value) {
		animateCorrectEl();
	} else {
		animateIncorrectEl();
	}
})
</script>

<style scoped>
.check-icon {
	--check-size: 50vmin;
	font-size: var(--check-size);
	width: var(--check-size);
	height: var(--check-size);
}
</style>