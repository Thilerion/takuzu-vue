<template>
	<div class="main-menu h-full min-h-full flex flex-col text-center flex-1 relative z-0">
		<div class="background-pattern-2"></div>
		<div class="background-pattern"></div>
		<div class="flex flex-col title-wrapper justify-center bg-opacity-20 pt-12">
			<app-title/>
		</div>
		<MainMenuButtons class="menu-wrapper relative" :can-continue="canContinue" :save-data="currentSaved" />
	</div>
</template>

<script>
import AppTitle from '@/components/AppTitle.vue';
import MainMenuButtons from '@/components/MainMenuButtons.vue';
import { useSavedPuzzle } from '@/services/useSavedPuzzle.js';

export default {
	setup() {
		const { savedPuzzle,
		hasCurrentSavedGame } = useSavedPuzzle();
		return {
			canContinue: hasCurrentSavedGame,
			currentSaved: savedPuzzle
		}
	},
	components: { AppTitle, MainMenuButtons },
};
</script>

<style scoped>
.main-menu {
	@apply bg-gray-50 dark:bg-slate-800;
}

.background-pattern {
	--pattern-color: hsla(175, 84%, 32%, 0.5);
	@apply h-full w-full absolute inset-0 z-0;
	background-color: transparent;
	background-image:  linear-gradient(var(--pattern-color) 1.8px, transparent 1.8px), linear-gradient(to right, var(--pattern-color) 1.8px, transparent 1.8px);
	background-size: 24px 24px;
	background-position: 18px 8px;
	mask-image: linear-gradient(120deg, rgba(0, 0, 0, 0.4) -140%, transparent 95%);
}

.background-pattern-2 {
	@apply h-full w-full absolute inset-0 z-0;
	background: conic-gradient(from -90deg at 50% 105%, theme('colors.slate.100'), transparent), rgba(84, 212, 221, 0.1);
}
.dark .background-pattern-2 {
	background: conic-gradient(from -90deg at 50% 105%, theme('colors.slate.900'), theme('colors.slate.700'));
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