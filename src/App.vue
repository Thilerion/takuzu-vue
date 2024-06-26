<template>
<div class="root">
	<router-view v-slot="{ Component, route }">
		<OverlayPageTransition show>
			<component :is="Component" :key="route.meta.usePuzzleKey ? puzzleKey : undefined" />
		</OverlayPageTransition>
	</router-view>
</div>
</template>

<script setup lang="ts">
import { onMounted, toRef } from 'vue';
import { useMainStore } from './stores/main';
import { initListeners as initPWAInstallListeners } from './composables/use-deferred-install-prompt';
import { initPregeneratedPuzzles } from './workers/pregen-puzzles/init';
import { useUpdateThemeColorWithRouteAndTheme } from './composables/use-meta-theme-color.js';
import { initSettingsPersistence } from './features/settings/store.js';

const store = useMainStore();
const puzzleKey = toRef(store, 'puzzleKey');

// init settings persistence, pwaInstallListeners, and populate or pregen the puzzles db
initSettingsPersistence();
initPWAInstallListeners();
useUpdateThemeColorWithRouteAndTheme();
onMounted(() => {
	initPregeneratedPuzzles();
})
</script>

<style>
html {
	height: -webkit-fill-available;
}
body {
	min-height: 100vh;
	min-height: -webkit-fill-available;
	min-height: 100svh;
	overscroll-behavior-y: none;
	@apply text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100;
}
.root {
	--vh-total: 100dvh;
	@apply relative flex flex-col z-0 min-h-vh;
}

.root.hide-overflow {
	max-height: var(--vh-total);
	max-width: 100vw;
	overflow: hidden;
}

#overlay-wrapper {
	min-height: 100svh;
	max-height: 100lvh;
	height: var(--vh-total);
	@apply w-full pointer-events-none overscroll-contain fixed z-20 top-0 left-0 overflow-hidden;
}
#overlay-container {
	@apply h-full w-full flex pointer-events-none;
}
#overlay-container > * {
	@apply pointer-events-auto;
}
</style>