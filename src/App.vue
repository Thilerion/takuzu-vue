<template>
	<div
		class="root"
	>
		<!-- TODO: transition for MainPage <-> OverlayPage -->
		<router-view v-slot="{ Component, route }">
			<OverlayPageTransition>
				<component :is="Component" :key="route.meta.usePuzzleKey ? puzzleKey : undefined" />
			</OverlayPageTransition>
		</router-view>

		<!-- container for overlays, for use with <teleport> component -->
		<div id="overlay-wrapper">
			<div id="overlay-container"></div>
		</div>
	</div>
</template>

<script setup>
import { initPregeneratedPuzzles } from '@/services/puzzles-db/init-pregen-puzzles.js';
import { computed, onMounted, toRef } from 'vue';
import { provideGlobalBuildData } from './app.globals.js';
import { initSettingsPersistence } from './stores/settings/index.js';
import { useStatisticsStore } from './stores/statistics.js';
import { useMainStore } from './stores/main.js';
import { initListeners as initPWAInstallListeners } from './composables/use-deferred-install-prompt';
import { useInitThemePreferenceProvider } from './composables/use-theme-preferences';

const store = useMainStore();
const puzzleKey = toRef(store, 'puzzleKey');
// init settings store
initSettingsPersistence();

// initDarkLightAutoTheme();
// useColorSchemeProvider();
useInitThemePreferenceProvider();
provideGlobalBuildData();

initPWAInstallListeners();

// load statistics store; to prevent store data from being reset each time statistics page gets unloaded
const statsStore = useStatisticsStore();

const viewportHeight = toRef(store.context, 'viewportHeight');

const viewportHeightPx = computed(() => viewportHeight.value ? `${viewportHeight.value}px` : '100%');

onMounted(() => {
	initPregeneratedPuzzles({
		pregenTimeout: 2000
	});
})
</script>

<style>
html {
	height: -webkit-fill-available;
}
body {
	min-height: 100vh;
	min-height: -webkit-fill-available;
	overscroll-behavior-y: none;
	@apply text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100;
}
.root {
	@apply relative flex flex-col z-0;
	--vh-total: v-bind(viewportHeightPx);
	min-height: var(--vh-total);
}

.root.hide-overflow {
	max-height: var(--vh-total);
	max-width: 100vw;
	overflow: hidden;
}


#overlay-wrapper {
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