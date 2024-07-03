import { defineStore } from "pinia";
import { useDeviceOrientation } from "./composables/useDeviceOrientation";
import { useViewportSize } from "./composables/useViewportSize";
import { usePageVisibility } from "./composables/usePageVisibility";
import { useBuildModeFlags } from "./composables/useBuildModeFlags";
import { useIsPwaInstalled } from "./composables/useIsPwaInstalled";
import { useIsFirstVisit } from "./composables/useIsFirstVisit";
import { useUserAgentData } from "./composables/useUserAgentData";
import { useBuildVersionDetails } from "./composables/version/useBuildVersionDetails";
import { useFeatureToggles } from "@/features/debug-mode/composables/debug-mode-features.js";
import { useIsDebugModeEnabled } from "@/features/debug-mode/composables/debug-mode-enabled.js";

const useAppContext = () => {
	const uaData = useUserAgentData();
	const { mobile: isMobile, ...userAgentData } = uaData;
	const hasTouchscreen = navigator?.maxTouchPoints > 0;
	const { orientation } = useDeviceOrientation();
	const { viewportWidth, viewportHeight } = useViewportSize();

	const { visibilityState: visibility, hidden: windowHidden, visible: windowVisible } = usePageVisibility();

	const { isInstalled } = useIsPwaInstalled();

	return {
		isMobile,
		userAgentData,

		isInstalled,
		orientation,
		viewportWidth,
		viewportHeight,
		visibility,
		windowHidden,
		windowVisible,
		
		hasTouchscreen,
	}
}

export const useMainStore = defineStore('main', {
	state: () => ({
		context: useAppContext(),
		buildModeFlags: useBuildModeFlags(),
		debugMode: useIsDebugModeEnabled(),
		featureToggles: useFeatureToggles(),
		visitData: useIsFirstVisit(),
		buildDetails: useBuildVersionDetails()
	})
})