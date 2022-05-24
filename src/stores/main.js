import { defineStore } from "pinia";
import { useDeviceOrientation } from "./composables/useDeviceOrientation";
import { useViewportSize } from "./composables/useViewportSize";
import { usePageVisibility } from "./composables/usePageVisibility";
import { useBuildModeFlags } from "./composables/useBuildModeFlags";
import { useDebugMode } from "./composables/useDebugMode";
import { useFeatureToggles } from "./composables/useFeatureToggle";

const { enabled: debugModeEnabled } = useDebugMode();

const useAppContext = () => {
	const isMobile = navigator?.userAgentData?.mobile ?? null;
	const hasTouchscreen = navigator?.maxTouchPoints > 0;
	const { orientation } = useDeviceOrientation();
	const { viewportWidth, viewportHeight } = useViewportSize();

	const { visibilityState: visibility, hidden: windowHidden, visible: windowVisible } = usePageVisibility();

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

export const useMainStore = defineStore('main', {
	state: () => ({
		puzzleKey: 0,
		context: useAppContext(),
		buildModeFlags: useBuildModeFlags(),
		debugMode: debugModeEnabled,
		featureToggles: useFeatureToggles()
	})
})