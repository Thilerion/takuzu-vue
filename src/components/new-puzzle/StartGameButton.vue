<template>
	<BaseButton
		:disabled="disabled || loading"
		class="btn-primary h-16 relative w-full mx-auto shadow disabled:shadow-none"
	>
	<transition name="fade-start" mode="out-in">
		<div v-if="!loading">
		<template v-if="!disabled">
			<div>Start game <small class="text-xs opacity-70 font-normal" v-if="replay">(replay)</small></div>
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
			<span v-if="!replay">Creating game...</span>
			<span v-else>Loading replay...</span>
		</div>
		</transition>
	</BaseButton>
</template>

<script setup lang="ts">
import type { BoardShape, DifficultyKey } from '@/lib/types.js';
import { computed } from 'vue';

type StartGameButtonProps = {
	disabled?: boolean,
	loading?: boolean,
	replay?: boolean,
	difficultyLabel: string,
	difficultyStars: DifficultyKey,
	size: BoardShape
}

const props = defineProps<StartGameButtonProps>();

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