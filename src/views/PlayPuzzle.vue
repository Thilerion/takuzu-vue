<template>
	<div class="fixed overflow-hidden inset-0 flex flex-col z-20 text-gray-900 bg-gray-50">
		<PlayGameHeader
			class="header"
			:rows="rows"
			:columns="columns"
			@close="exitGame"
			@open-settings="openSettings"
		/>
	</div>
</template>

<script>
import store from '@/store';
import PlayGameHeader from '@/components/play-game/PlayGameHeader.vue';

export default {
	components: {PlayGameHeader},
	computed: {
		rows() {
			return this.$store.state.puzzle.height;
		},
		columns() {
			return this.$store.state.puzzle.width;
		}
	},
	methods: {
		exitGame() {
			console.log('Should close puzzle');
		},
		openSettings() {
			console.log('Should open settings');
		}
	},
	beforeRouteEnter(to, from, next) {
		if (!store.state.puzzle.initialized) {
			console.log(store.state.puzzle);
			console.warn('Game not initialized... Redirecting to New Game.');
			return next({ name: 'FreePlay', replace: true});
		}
		if (from.name === 'FreePlay') {
			to.meta.from = 'FreePlay';
		} else {
			to.meta.from = null;
		}
		next();
	},
};
</script>

<style lang="postcss" scoped>
	
</style>