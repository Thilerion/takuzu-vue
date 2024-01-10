<template>
	<div
		class="fixed bottom-0 inset-0 w-full min-h-full pointer-events-none z-20 h-full"
	>
		<transition name="t-slide-up">
				<PuzzleHint
					class="z-50 absolute bottom-0 pointer-events-none"
					v-if="showHint"
					:hint="currentHint"
					@done="puzzleHintsStore.removeHint"
					@hide="puzzleHintsStore.hide"
				></PuzzleHint>
		</transition>
	</div>
</template>

<script setup lang="ts">
import { usePuzzleHintsStore } from '@/stores/puzzle-hinter';
import { storeToRefs } from 'pinia';

const puzzleHintsStore = usePuzzleHintsStore();
const { showHint, currentHint } = storeToRefs(puzzleHintsStore);
</script>

<style scoped>
.t-slide-up-enter-active {
	@apply transition duration-300 ease-out;
}
.t-slide-up-leave-active {
	@apply transition duration-150 ease-in;
}

.t-slide-up-enter-from {
	@apply translate-y-1/2 opacity-0;
}
.t-slide-up-leave-to {
	@apply translate-y-1/4 opacity-0;
}
</style>