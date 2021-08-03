<template>
	<!-- <progress :max="initialEmpty" :value="currentFilled"></progress> -->
	<div
		class="progress-wrapper"
		:class="{ 
			error: finishedWithMistakes,
			finished
		}"
	>
		<div
			:style="{'--progress': progressValueTransformed}"
			class="progress-value"
		></div>
	</div>
</template>

<script>
export default {
	computed: {
		progressValue() {
			return this.$store.getters['puzzle/progress'];
		},
		progressValueTransformed() {
			return Math.max(this.progressValue, 0.005);
		},
		finished() {
			return this.progressValue === 1;
		},
		finishedWithMistakes() {
			return this.$store.getters['puzzle/finishedWithMistakes'];
		}
	}
};
</script>

<style lang="postcss" scoped>
/* progress { */
	/* reset */
	/* @apply appearance-none border-0; */
	/* size and position */
	/* @apply h-1 w-full absolute inset-x-0 top-0;
} */

/* progress::-webkit-progress-bar {
	background-color: transparent;
}
progress::-webkit-progress-value {
	background-color: red;
} */

.progress-wrapper {
	@apply w-full absolute inset-x-0 top-0 bg-gray-400 bg-opacity-20 pointer-events-none;
	height: 3px;
}
.progress-value {
	@apply h-full w-full bg-teal-600 opacity-50;
	@apply transform origin-left;
	transform: scaleX(var(--progress, 0.1));
	transition: transform .25s ease, opacity .15s ease;
}

.finished .progress-value {
	@apply opacity-100;
}

.finished.error .progress-value {
	@apply bg-red-500;
}
</style>