<template>
<div
	class="fixed bottom-0 inset-0 w-full min-h-full pointer-events-none z-20 h-full"
>
	<transition name="t-slide-up">
		<PuzzleHintStepped
			v-if="currentHint != null"
			:hint="currentHint"
			:show="isHintShown"
			@hide="hide"
		/>
	</transition>
</div>
</template>

<script setup lang="ts">
import { usePuzzleEvent } from '@/composables/puzzle-events.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { storeToRefs } from 'pinia';
import { watchEffect } from 'vue';
import { usePuzzleHintsStore } from '@/features/hints/store.js';

const puzzleHintsStore = usePuzzleHintsStore();
const { isHintShown, currentHint } = storeToRefs(puzzleHintsStore);
const { hide } = puzzleHintsStore;

const puzzleStore = usePuzzleStore();
watchEffect(() => {
	if (puzzleStore.paused) {
		hide();
		return;
	}
})

usePuzzleEvent('value-change', () => {
	if (isHintShown.value) {
		hide();
	}
});

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