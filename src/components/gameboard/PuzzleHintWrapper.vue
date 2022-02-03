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
import PuzzleHint from './PuzzleHint.vue';

export default {
	components: {
		PuzzleHint
	},
	computed: {
		showHint() {
			return this.$store.state.puzzle.assistance.hints.showHint;
		},
		currentHint() {
			return this.$store.state.puzzle.assistance.hints.currentHint;
		},
		hint() {
			if (this.showHint && !this.currentHint) {
				console.error('Should show hint but none available. Hiding hint now.');
				this.hideHint();
				return null;
			}
			return this.currentHint;
		}
	},
	methods: {
		hideHint() {
			this.$store.commit('puzzle/assistance/setHintVisible', false);
		},
		removeHint() {
			// TODO: remove hint from store
			console.log('Todo: remove hint from store after execution?');
			this.hideHint();
		}
	}
};
</script>

<style scoped>
	
</style>