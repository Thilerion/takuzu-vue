<template>
	<PlayGame @close="closeCurrentPuzzle" />
</template>

<script>
import store from '@/store';
import PlayGame from '@/components/play-game/PlayGame';

export default {
	components: {PlayGame},
	computed: {
		gameInitialized() {
			return this.$store.state.game.initialized;
		}
	},
	methods: {
		closeCurrentPuzzle() {
			console.log('Should close puzzle');
		}
	},
	beforeRouteEnter(to, from, next) {
		if (!store.state.game.initialized) {
			console.log(store.state.game);
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
	watch: {
		gameInitialized(value, prevValue) {
			if (prevValue && !value) {
				if (this.$route.meta.from) {
					console.log('going back one');
					this.$router.go(-1);
				} else {
					console.log('replacing route to FreePlay');
					this.$router.replace({ name: 'FreePlay' });
				}
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>