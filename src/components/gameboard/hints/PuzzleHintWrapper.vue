<template>
	<div
		class="fixed bottom-0 inset-0 w-full min-h-full pointer-events-none z-20 h-full"
	>
		<transition name="t-slide-up">
				<PuzzleHint
					class="z-50 absolute bottom-0 pointer-events-none"
					v-if="renderableLegacyHint"
					:hint="renderableLegacyHint"
					@done="puzzleHintsStore.removeHint"
					@hide="hide"
				></PuzzleHint>
				<div
					v-else-if="renderableSteppedHint"
					class="z-50 absolute bottom-0 pointer-events-none hint w-full inset-x-0 h-full flex items-end"
				>
					<div
						class="hint-inner
						max-h-32
						bg-white dark:bg-slate-700 text-slate-900 dark:text-white
						w-full text-sm flex flex-col
						pointer-events-auto flex-1 min-h-[6.5rem]
						"
					>Stepped hint: TODO</div>
				</div>
		</transition>
	</div>
</template>

<script setup lang="ts">
import type { Hint } from '@/stores/hints/Hint.js';
import type { SteppedHint } from '@/stores/hints/stepped-hint/SteppedHint.js';
import { usePuzzleHintsStore } from '@/stores/hints/store.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { storeToRefs } from 'pinia';
import { computed, watchEffect } from 'vue';

const puzzleHintsStore = usePuzzleHintsStore();
const { showHint, currentHint } = storeToRefs(puzzleHintsStore);
const { hide } = puzzleHintsStore;

const renderableLegacyHint = computed((): null | Hint => {
	if (showHint.value && currentHint.value != null && currentHint.value.isLegacyHint) {
		return currentHint.value;
	}
	return null;
})
const renderableSteppedHint = computed((): null | SteppedHint => {
	if (showHint.value && currentHint.value != null && !currentHint.value.isLegacyHint && currentHint.value.isSteppedHint) {
		return currentHint.value;
	}
	return null;
}) 

const puzzleStore = usePuzzleStore();
watchEffect(() => {
	if (puzzleStore.paused) {
		hide();
		return;
	}
})
puzzleStore.$onAction(({
	name
}) => {
	// hide the hint if a value is set on the board
	if (name === '_setValue' && showHint.value) hide();
})

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