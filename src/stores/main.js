import { usePageVisibility } from "@/composables/use-page-visibility";
import { isDebugModeEnabledInLocalStorage, persistDebugMode } from "@/services/debug-mode";
import { throttledRef, useWindowSize, useMediaQuery } from "@vueuse/core";
import { markRaw, ref, watch, watchEffect, computed, reactive } from "vue";
import { defineStore } from "pinia";

const useDeviceOrientation = () => {
	const isLandscape = useMediaQuery('(orientation: landscape)');
	const isPortrait = useMediaQuery('(orientation: portrait)');
	return computed(() => {
		if (isLandscape.value && !isPortrait.value) {
			return 'landscape';
		} else if (!isLandscape.value && isPortrait.value) {
			return 'portrait';
		} else {
			return null;
		}
	})
}

const useAppContext = () => {
	const isMobile = navigator?.userAgentData?.mobile ?? null;
	const hasTouchscreen = navigator?.maxTouchPoints > 0;
	const orientation = useDeviceOrientation();
	const viewportSize = useWindowSize({
		initialWidth: window.innerWidth,
		initialHeight: window.innerHeight
	})
	const viewportWidth = throttledRef(viewportSize.width, 1000 / 30, true, false);
	const viewportHeight = throttledRef(viewportSize.height, 1000 / 30, true, false);

	const pageVisibility = usePageVisibility();
	const { visibility, hidden: windowHidden, visible: windowVisible } = pageVisibility;

	return {
		isMobile,
		hasTouchscreen,
		orientation,
		viewportWidth,
		viewportHeight,
		visibility,
		windowHidden,
		windowVisible
	}
}
const useBuildModeFlags = () => {
	return markRaw({
		devMode: import.meta.env.DEV,
		productionMode: import.meta.env.PROD,
		appMode: import.meta.env.MODE,
	})
}
const useDebugModeFlags = () => {
	const enabled = ref(isDebugModeEnabledInLocalStorage({
		defaultValue: import.meta.env.DEV
	}));
	
	// feature flags
	const addPuzzleToHistoryWithCheats = ref(false);
	const enableTools = ref(enabled.value);
	const enableCustomPuzzleTool = ref(enabled.value);
	const enableAnalysisTool = ref(enabled.value);

	watch(enabled, (value) => {
		persistDebugMode(value);
	})

	return {
		debugMode: enabled,
		flags: {
			addPuzzleToHistoryWithCheats,
			tools: enableTools,
			customPuzzleTool: enableCustomPuzzleTool,
			analysisTool: enableAnalysisTool
		}
	}
}

export const useMainStore = defineStore('main', {
	state: () => ({
		puzzleKey: 0,
		context: useAppContext(),
		buildModeFlags: useBuildModeFlags(),
		...useDebugModeFlags(),
	}),

	actions: {
		setDebugMode(value) {
			if (value == null) {
				this.debugMode = !this.debugMode;
			} else {
				this.debugMode = !!value;
			}
		}
	}
})