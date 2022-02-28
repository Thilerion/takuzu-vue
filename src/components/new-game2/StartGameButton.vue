<template>
	<BaseButton
		:disabled="disabled || loading"
		class="btn-primary h-16 relative w-full mx-auto shadow disabled:shadow-none"
	>
	<transition name="fade-start" mode="out-in">
		<div v-if="!loading">
		<template v-if="!disabled">
			<div>Start game</div>
			<div class="text-xs" v-if="!disabled">{{sizeStr}} - {{difficultyLabel}} - {{difficultyStars}}*</div>
			<div class="text-xs font-normal" v-else>Please select a puzzle size.<br>Note: some puzzle sizes are disabled for harder puzzles.</div>
		</template>
		<template v-else-if="disabled">
			<div>Select a puzzle size</div>
			<div class="text-xs font-normal">Note: some puzzle sizes are disabled for harder puzzles.</div>
		</template>
		</div>
		<div v-else-if="loading">
			<div class="absolute inset-y-0 w-1/3 left-0 flex justify-center items-center">
				<LoadingSpinner
					:size="32"
				/>
			</div>
			<span>Creating game...</span>
		</div>
		</transition>
	</BaseButton>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from '../global/BaseButton.vue';
import LoadingSpinner from '../global/base-layout/LoadingSpinner.vue';

const props = defineProps({
	disabled: Boolean,
	loading: Boolean,
	difficultyLabel: {
		type: String,
		required: true
	},
	difficultyStars: {
		type: Number,
		required: true
	},
	size: {
		type: Object,
		required: true
	}
})

const sizeStr = computed(() => {
	return `${props.size.width}x${props.size.height}`;
})
</script>

<style scoped>
.fade-start-enter-active, .fade-start-leave-active {
	transition: opacity .1s ease;
}
.fade-start-enter-from, .fade-start-leave-to {
	opacity: 0;
}
</style>