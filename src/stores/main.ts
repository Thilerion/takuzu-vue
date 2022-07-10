import { defineStore } from "pinia";
import { useDeviceOrientation } from "./composables/useDeviceOrientation";
import { useViewportSize } from "./composables/useViewportSize";
import { usePageVisibility } from "./composables/usePageVisibility";
import { useBuildModeFlags } from "./composables/useBuildModeFlags";
import { useDebugMode } from "./composables/useDebugMode";
import { useFeatureToggles } from "./composables/useFeatureToggle";
import { useTouchDetection } from "./composables/useDetectTouch";
import { useIsPwaInstalled } from "./composables/useIsPwaInstalled";
import { useIsFirstVisit } from "./composables/useIsFirstVisit";
import { useUserAgentData } from "./composables/useUserAgentData";
import { useBuildVersionDetails } from "./composables/version/useBuildVersionDetails";

const { enabled: debugModeEnabled } = useDebugMode();

const useAppContext = () => {
	const uaData = useUserAgentData();
	const { mobile: isMobile, ...userAgentData } = uaData;
	const hasTouchscreen = navigator?.maxTouchPoints > 0;
	const { orientation } = useDeviceOrientation();
	const { viewportWidth, viewportHeight } = useViewportSize();

	const { visibilityState: visibility, hidden: windowHidden, visible: windowVisible } = usePageVisibility();

	const { hasTouched, lastInteractionType, lastInteractionWasTouch } = useTouchDetection();

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
		hasTouched,
		lastInteractionType,
		lastInteractionWasTouch
	}
}

export const useMainStore = defineStore('main', {
	state: () => ({
		puzzleKey: 0,
		context: useAppContext(),
		buildModeFlags: useBuildModeFlags(),
		debugMode: debugModeEnabled,
		featureToggles: useFeatureToggles(),
		visitData: useIsFirstVisit(),
		buildDetails: useBuildVersionDetails()
	})
})