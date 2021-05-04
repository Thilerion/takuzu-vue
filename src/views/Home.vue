<template>
	<div class="main-menu h-full min-h-full flex flex-col text-center flex-1 space-y-14">
		<div class="flex flex-col title-wrapper justify-end bg-opacity-20">
			<app-title/>
			<!-- <span>Title here</span> -->
		</div>
		<div class="flex flex-col items-center justify-start route-wrapper space-y-4">
			<router-link
				v-if="canContinue"
				:to="{ path: '/play', query: { continue: true}}"
				custom
				v-slot="{ navigate }"
			><BaseButton
				@click="navigate"
				class="btn-primary text-base uppercase shadow-md route-btn route-primary"
			>Continue</BaseButton></router-link>

			<router-link
				to="/play"
				custom
				v-slot="{ navigate }"
			><BaseButton
				@click="navigate"
				class="text-base uppercase route-btn route-primary"
				:class="{'btn-primary': !canContinue, 'shadow-md': !canContinue}"
			>New Game</BaseButton></router-link>

			<div class="pt-4">
				<router-link to="/how-to-play" class="route-btn route-secondary">How to play</router-link>
			</div>
		</div>
	</div>
</template>

<script>
import { hasCurrentSavedGame } from '@/services/save-game';
import AppTitle from '@/components/AppTitle.vue';
import BaseButton from '@/components/global/BaseButton';
export default {
	components: { AppTitle, BaseButton },
	data() {
		return {
			canContinue: null,
		}
	},
	beforeMount() {
		this.canContinue = hasCurrentSavedGame();
	}
};
</script>

<style lang="postcss" scoped>
.main-menu {
	background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='pattern' width='52' height='52' viewBox='0 0 40 40' patternUnits='userSpaceOnUse' patternTransform='rotate(28)'%3E%3Crect id='pattern-background' width='400%25' height='400%25' fill='rgba(247, 250, 252,0.4)'%3E%3C/rect%3E%3Cpath fill='rgba(237, 242, 247,0.4)' d='M0 0L20 0L20 20L0 20L0 0zM6 6L6 14L17.9 17.9L14 6zM20 20L40 20L40 40L20 40L20 20zM22.1 22.1L26 34L34 34L34 26z'%3E%3C/path%3E%3Cpath fill='rgba(237, 242, 247,0.3)' d='M26 6L34 6L34 14L26 14zM6 26L14 26L14 34L6 34z'%3E%3C/path%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23pattern)' height='100%25' width='100%25'%3E%3C/rect%3E%3C/svg%3E");
}

.title-wrapper {
	@apply flex-1;
	flex-grow: 2;
	max-height: 35vh;
}
.route-wrapper {
	@apply flex-auto;
}
.route-btn {
	@apply w-2/3 font-normal;
	max-width: 18rem;
}
.route-btn.route-primary {
	@apply tracking-wider py-3;
}
.route-btn.route-secondary {
	@apply tracking-wide;
}
</style>