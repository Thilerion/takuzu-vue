<template>
<div class="main-menu h-full min-h-full flex flex-col text-center flex-1 relative z-0">
	<div class="background-pattern-2"></div>
	<div class="background-pattern"></div>
	<div class="home-notifications min-h-[5rem] sticky top-2 inset-x-0 w-full z-10 mx-auto">
		<NewUpdateNotification @displayed="(val) => newUpdateNotificationShown = val" />
		<PwaInstallNotification v-if="!newUpdateNotificationShown" />
	</div>
	
	<div class="flex flex-col title-wrapper justify-center bg-opacity-20 pt-2">
		<app-title />
	</div>
	<MainMenuButtons
		class="menu-wrapper relative"
		:can-continue="hasCurrentSavedGame"
		:save-data="savedPuzzle"
	/>
</div>
</template>

<script setup lang="ts">
import { useSavedPuzzle } from '@/services/savegame/useSavedGame.js';
import { ref } from 'vue';

const { savedPuzzle, hasCurrentSavedGame } = useSavedPuzzle();

const newUpdateNotificationShown = ref(false);
</script>

<style scoped>
.main-menu {
	@apply bg-gray-50 dark:bg-slate-800;
}

.background-pattern {
	--pattern-color-light: hsla(175, 84%, 32%, 0.5);
	--pattern-color-dark: hsla(175, 84%, 92%, 0.7);

	--pattern-color: var(--pattern-color-light);
	@apply h-full w-full absolute inset-0 z-0;
	background-color: transparent;
	background-image:  linear-gradient(var(--pattern-color) 1.8px, transparent 1.8px), linear-gradient(to right, var(--pattern-color) 1.8px, transparent 1.8px);
	background-size: 24px 24px;
	background-position: 18px 8px;
	mask-image: linear-gradient(120deg, rgba(0, 0, 0, 0.4) -140%, transparent 95%);
}
[data-base-theme="dark"] .background-pattern {
	--pattern-color: var(--pattern-color-dark);
}

.background-pattern-2 {
	@apply h-full w-full absolute inset-0 z-0;
	background: conic-gradient(from -90deg at 50% 105%, theme('colors.slate.100'), transparent), rgba(84, 212, 221, 0.1);
}
[data-base-theme="dark"] .background-pattern-2 {
	background: conic-gradient(from -90deg at 30% 105%, theme('colors.slate.700'), theme('colors.slate.800'));
}

.title-wrapper {
	@apply flex-1;
	flex-grow: 3;
	min-height: 8rem;
}
.menu-wrapper {
	@apply mt-auto flex-1;
	flex-grow: 1;

	min-height: 14rem;
	height: 34vh;
	max-height: 20rem;
}

.home-notifications {
	width: clamp(
		theme('width.72'),
		42ch,
		theme('maxWidth.md')
	);
}
</style>