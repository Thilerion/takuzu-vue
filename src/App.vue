<template>
	<div
		class="root"
	>
		<!-- TODO: transition for MainPage <-> OverlayPage -->
		<router-view v-slot="{ Component, route }">
			<overlay-page-transition>
				<component :is="Component" :key="route.meta.usePuzzleKey && puzzleKey" />
			</overlay-page-transition>
		</router-view>

		<!-- container for overlays, for use with <teleport> component -->
		<div id="overlay-wrapper">
			<div id="overlay-container"></div>
		</div>
	</div>
</template>

<script>
import OverlayPageTransition from '@/views/transitions/OverlayPageTransition.vue';
import { initPregenWorker } from '@/workers/pregen-puzzles.js';
import { initDarkLightAutoTheme } from '@/services/dark-light-auto-theme.js';
import { computed, onMounted } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { provideGlobalBuildData } from './app.globals.js';
import { useStore } from 'vuex';
import { useSettingsStore, initSettingsWatcher } from './stores/settings.js';

export default {
	components: {
		OverlayPageTransition
	},
	setup() {
		const store = useStore();
		const puzzleKey = computed(() => store.state.puzzleKey);

		// init settings store
		const settingsStore = useSettingsStore();
		initSettingsWatcher(settingsStore);


		// TODO: dark mode not enabled when app loads if enabled in settings
		initDarkLightAutoTheme();
		provideGlobalBuildData();

		const { height } = useWindowSize();
		const viewportHeight = computed(() => height.value ? `${height.value}px` : '100%');


		onMounted(() => {
			initPregenWorker();
		})

		return { 
			viewportHeight,
			puzzleKey
		}
	}
};
</script>

<style>
html {
	height: -webkit-fill-available;
}
body {
	min-height: 100vh;
	min-height: -webkit-fill-available;
	overscroll-behavior-y: none;
	@apply text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-50;
}
.root {
	@apply relative flex flex-col z-0;
	--vh-total: v-bind(viewportHeight);
	min-height: var(--vh-total);
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