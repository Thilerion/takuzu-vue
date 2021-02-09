<template>
	<div class="absolute h-full w-full pointer-events-none flex flex-col">
		<transition name="hint-fade">
			<GameHint
				v-if="showHint"
				v-bind="hint"
				@hide="hideHint"
				@done="removeHint"
			/>
		</transition>
	</div>
</template>

<script>
import GameHint from './GameHint.vue';

export default {
	components: { 
		GameHint,
	},
	data() {
		return {
			hasOverflow: false,
		}
	},
	computed: {
		showHint() {
			return this.$store.state.game.gameCheck.showHint;
		},
		currentHint() {
			return this.$store.state.game.gameCheck.currentHint;
		},
		hint() {
			const curHint = this.currentHint;
			if (this.showHint && curHint == null) {
				console.warn('Showing hint but no current hint available?! Showing fallback hint.');
				return {
					message: 'No hint available. Would you like to reveal a random cell?',
					actions: [
						{ label: 'Reveal', onClick: (vm, store) => {
							console.log('Should reveal random square now.');
							store.dispatch('revealRandomCell')
						} }
					],
					id: -1
				}
			}
			return curHint;
		}
	},
	methods: {
		hideHint() {
			this.$store.commit('gameCheck/setHintVisible', false);
		},
		removeHint() {
			console.log('The hint has been executed. It should now be removed from the store.');
			this.hideHint();
			// TODO: remove hint from store
			// TODO: after executing final hint option, which just sets the value, mark which value was set!
		},
	},
};
</script>

<style lang="postcss" scoped>

</style>