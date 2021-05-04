<template>
	<div class="main-menu h-full flex-1 flex flex-col items-center justify-center text-center">
		<AppTitle />
		<nav class="">
			<div class="routes main-routes flex flex-col">
				<router-link v-if="canContinue" :to="{ path: '/play', query: { continue: true}}">Continue</router-link>
				<router-link to="/play">New game</router-link>
				<!-- <router-link to="/daily">Daily puzzles</router-link> -->
				<!-- <router-link to="/arcade">Arcade</router-link> -->
			</div>
			<div class="routes secondary-routes flex flex-col">
				<router-link to="/how-to-play">How to play</router-link>
			</div>			
		</nav>
	</div>
</template>

<script>
import { hasCurrentSavedGame } from '@/services/save-game'
import AppTitle from '@/components/AppTitle.vue';

export default {
	name: 'MainMenu',
	components: {
		AppTitle,		
	},
	data() {
		return {
			canContinue: false,
		}
	},
	beforeMount() {
		this.canContinue = hasCurrentSavedGame();
	},
}
</script>

<style lang="postcss" scoped>
.main-menu {
	background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='pattern' width='52' height='52' viewBox='0 0 40 40' patternUnits='userSpaceOnUse' patternTransform='rotate(28)'%3E%3Crect id='pattern-background' width='400%25' height='400%25' fill='rgba(247, 250, 252,0.4)'%3E%3C/rect%3E%3Cpath fill='rgba(237, 242, 247,0.4)' d='M0 0L20 0L20 20L0 20L0 0zM6 6L6 14L17.9 17.9L14 6zM20 20L40 20L40 40L20 40L20 20zM22.1 22.1L26 34L34 34L34 26z'%3E%3C/path%3E%3Cpath fill='rgba(237, 242, 247,0.3)' d='M26 6L34 6L34 14L26 14zM6 26L14 26L14 34L6 34z'%3E%3C/path%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23pattern)' height='100%25' width='100%25'%3E%3C/rect%3E%3C/svg%3E")
}

.main-routes {
	@apply text-2xl tracking-wide;
	line-height: 3rem;
}
.secondary-routes {
	@apply text-lg pt-4;
	line-height: 2.25rem;
}
</style>
