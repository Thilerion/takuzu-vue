<template>
	<div class="absolute top-0 left-0 h-full w-full pointer-events-none flex flex-col overflow-hidden">
		<transition name="hint-fade">
			<PuzzleHint
				v-if="showHint"
				v-bind="hint"
				:hint="hint"
				@hide="hideHint"
				@done="removeHint"
			/>
		</transition>
	</div>
</template>

<script>
import { usePuzzleHintsStore } from '@/stores/puzzle-hinter.js';
import { storeToRefs } from 'pinia';
import PuzzleHint from './PuzzleHint.vue';

export default {
	components: {
		PuzzleHint
	},
	setup() {
		const puzzleHintsStore = usePuzzleHintsStore();

		const { showHint, currentHint } = storeToRefs(puzzleHintsStore);
		const hideHint = () => puzzleHintsStore.showHint = false;
		const removeHint = () => {
			// TODO: remove hint from store
			console.log('Todo: remove hint from store after execution?');
			hideHint();
		}

		return { showHint, currentHint, removeHint, hideHint };
	},
	computed: {
		hint() {
			if (this.showHint && !this.currentHint) {
				console.error('Should show hint but none available. Hiding hint now.');
				this.hideHint();
				return null;
			}
			return this.currentHint;
		}
	},
};
</script>

<style scoped>
	
</style>