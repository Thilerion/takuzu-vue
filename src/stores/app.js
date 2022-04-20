import { usePageVisibility } from "@/composables/use-page-visibility";
import { isDebugModeEnabledInLocalStorage, persistDebugMode } from "@/services/debug-mode.js";
import { useMediaQuery, useWindowSize } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, readonly } from "vue";

export const useAppStore = defineStore('app', {

	state: () => ({
		debugMode: isDebugModeEnabledInLocalStorage({
			defaultValue: import.meta.env.DEV
		}),
		// to force rerender after starting a new game when previous one has finished
		puzzleKey: 0,

		context: {
			isMobile: checkUserAgentIsMobile(),
			touch: hasTouchscreen(),
			orientation: useDeviceOrientation(),
			viewportSize: useWindowSize(),
			visibility: usePageVisibility().visibility,
		}
	}),

	getters: {
		viewportHeight: (state) => state.context.viewportSize.height,
		viewportWidth: state => state.context.viewportSize.width,

		windowVisible: state => state.context.visibility === 'visible',
		windowHidden: state => state.context.visibility !== 'visible',
	},

	actions: {
		setDebugMode(enable) {
			const value = !!enable;
			persistDebugMode(value);
			this.debugMode = value;
		}
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