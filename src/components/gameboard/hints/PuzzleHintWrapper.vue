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
				<PuzzleHintStepped
					v-else-if="renderableSteppedHint"
					:hint="renderableSteppedHint"
					:show="isHintShown"
					@hide="hide"
				/>
				<PuzzleHintBase
					v-else-if="renderableFallbackNoneFoundHint"
					@hide="hide"
				>
					<template #title>{{ $t('Hints.none-found.no-hint-found') }}</template>
					<template #message>{{  $t('Hints.none-found.no-hint-found-too-hard-message') }}</template>
				</PuzzleHintBase>
		</transition>
	</div>
</template>

<script setup lang="ts">
import type { Hint } from '@/stores/hints/Hint.js';
import type { SteppedHint } from '@/stores/hints/stepped-hint/types.js';
import { usePuzzleHintsStore } from '@/stores/hints/store.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { storeToRefs } from 'pinia';
import { computed, watchEffect } from 'vue';

const puzzleHintsStore = usePuzzleHintsStore();
const { isHintShown, currentHint, hintSearchedButNoneFound } = storeToRefs(puzzleHintsStore);
const { hide } = puzzleHintsStore;

const renderableLegacyHint = computed((): null | Hint => {
	if (isHintShown.value && currentHint.value != null && currentHint.value.isLegacyHint) {
		return currentHint.value;
	}
	return null;
})
const renderableSteppedHint = computed((): null | SteppedHint => {
	// Note: gets rendered even if isHintShown is false
	if (currentHint.value != null && !currentHint.value.isLegacyHint && currentHint.value.isSteppedHint) {
		return currentHint.value;
	}
	return null;
})
const renderableFallbackNoneFoundHint = computed((): null | true => {
	if (hintSearchedButNoneFound.value && isHintShown.value) return true;
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
	// hide the hint whenever a value is set on the board
	if (name === 'assignToBoard' && isHintShown.value) hide();
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