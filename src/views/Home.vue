<template>
	<div class="main-menu h-full min-h-full flex flex-col text-center flex-1 relative z-0">
		<div class="background-pattern"></div>
		<div class="background-pattern-2"></div>
		<div class="flex flex-col title-wrapper justify-center bg-opacity-20 pt-12">
			<app-title/>
		</div>
		<MainMenuButtons class="menu-wrapper relative" :can-continue="canContinue" />
	</div>
</template>

<script>
import { hasCurrentSavedGame } from '@/services/save-game';
import AppTitle from '@/components/AppTitle.vue';
import MainMenuButtons from '@/components/MainMenuButtons.vue';

export default {
	components: { AppTitle, MainMenuButtons },
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
	@apply bg-gray-50;
}

.background-pattern {
	--pattern-color: hsla(175, 84%, 32%, 0.5);
	@apply h-full w-full absolute inset-0 z-0;
	background-color: #ffffff;
	background-image:  linear-gradient(var(--pattern-color) 1.8px, transparent 1.8px), linear-gradient(to right, var(--pattern-color) 1.8px, #ffffff 1.8px);
	background-size: 24px 24px;
	background-position: 18px 8px;
}
.background-pattern-2 {
	background-image: linear-gradient( 180deg, hsla(213, 40%, 98%, 0.9) 0%,  hsla(213, 58%, 97%, 0.995) 40%, theme(colors.gray.50) 91.1% );
	@apply h-full w-full absolute inset-0 z-0;
}

.title-wrapper {
	@apply flex-1;
	flex-grow: 4;
	min-height: 10rem;
}
.menu-wrapper {
	@apply mt-auto flex-1;
	flex-grow: 1;

	min-height: 14rem;
	height: 34vh;
	max-height: 20rem;
}
</style>