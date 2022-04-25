import { usePageVisibility } from "@/composables/use-page-visibility";
import { isDebugModeEnabledInLocalStorage, persistDebugMode } from "@/services/debug-mode.js";
import { useMediaQuery, useWindowSize } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, markRaw, reactive, readonly, ref, toRef } from "vue";

export const useMainStore = defineStore('main', () => {
	const puzzleKey = ref(0);

	const context = reactive({
		isMobile: checkUserAgentIsMobile(),
		touch: hasTouchscreen(),
		orientation: useDeviceOrientation(),
		viewportSize: useWindowSize(),
		pageVisibility: usePageVisibility(),
	});

	const viewportHeight = computed(() => context.viewportSize.height);
	const viewportWidth = computed(() => context.viewportSize.width);
	const windowVisible = computed(() => context.pageVisibility.visibility === 'visible');
	const windowHidden = computed(() => context.pageVisibility.visibility !== 'visible');

	const buildModeFlags = markRaw({
		devMode: import.meta.env.DEV,
		productionMode: import.meta.env.PROD,
		appMode: import.meta.env.MODE,
	});

	const debugModeData = reactive({
		enabled: isDebugModeEnabledInLocalStorage({
			defaultValue: import.meta.env.DEV
		}),

		// feature flags
		addPuzzleToHistoryWithCheats: false
	});

	const setDebugMode = (enable) => {
		const value = !!enable;
		persistDebugMode(value);
		debugModeData.enabled = value;
	}

	const flags = computed(() => {
		return {
			...buildModeFlags,
			debugMode: debugModeData.enabled
		}
	})

	return {
		puzzleKey,
		context,
		viewportHeight,
		viewportWidth,
		windowVisible,
		windowHidden,
		buildModeFlags,
		debugModeData,
		flags,
		setDebugMode
	}
})

const checkUserAgentIsMobile = () => {
	try {
		return !!navigator.userAgentData.mobile;
	} catch (e) {
		console.warn('Could not check isMobile from user agent hint.');
		console.error(e);
		return null;
	}
}

const hasTouchscreen = () => {
	return !!navigator.maxTouchPoints > 0;
}

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