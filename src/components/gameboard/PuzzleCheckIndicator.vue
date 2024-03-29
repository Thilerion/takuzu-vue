<template>
	<div class="pointer-events-none fixed inset-0 z-10 grid place-content-center w-screen h-vh">
		<div class="opacity-0 row-start-1 col-start-1 row-span-1 col-span-1 z-10 relative" ref="correctEl">
			<div class="check-icon-wrapper">
				<icon-ic-outline-check-circle class="text-green-600 check-icon" />
			</div>
		</div>
		<div class="opacity-0 row-start-1 col-start-1 row-span-1 col-span-1 z-10 relative" ref="incorrectEl">
			<div class="check-icon-wrapper">
				<icon-ic-outline-cancel class="text-red-700 check-icon" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { usePuzzleMistakesStore } from "@/stores/puzzle-mistakes.js";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";

const mistakesStore = usePuzzleMistakesStore();
const { currentMarked, checkId, lastCheckType } = storeToRefs(mistakesStore);

const lastCheckedByUser = computed(() => lastCheckType.value === 'user');

const correctEl = ref(null);
const incorrectEl = ref(null);

const errorFound = computed(() => {
	return currentMarked.value?.length > 0;
})

const checkAnim = {
	options: {
		duration: 2000,
		iterations: 1,
		fill: 'forwards',
		easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
	},
	keyframes: [
		{ opacity: 0 },
		{ opacity: 0.8, offset: 0.12 },
		{ opacity: 0 }
	]
}

let correctElAnimation = null;
let incorrectElAnimation = null;

const animateCorrectEl = () => {
	const el = correctEl.value;
	incorrectElAnimation?.cancel?.();
	if (correctElAnimation == null) {
		correctElAnimation = el.animate(checkAnim.keyframes, checkAnim.options);
		correctElAnimation.persist();
	} else {
		console.log('play it');
		correctElAnimation.cancel();
		correctElAnimation.play();
	}
}
const animateIncorrectEl = () => {
	const el = incorrectEl.value;
	correctElAnimation?.cancel?.();
	if (incorrectElAnimation == null) {
		incorrectElAnimation = el.animate(checkAnim.keyframes, checkAnim.options);
		incorrectElAnimation.persist();
	} else {
		console.log('play it');
		incorrectElAnimation.cancel();
		incorrectElAnimation.play();
	}
}

watch(checkId, (value, prev) => {
	if (!lastCheckedByUser.value || value < prev) {
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
	font-size: 50vmin;
	width: 50vmin;
	height: 50vmin;
}
</style>