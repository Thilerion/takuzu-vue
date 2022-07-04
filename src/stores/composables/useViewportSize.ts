import { throttledRef, useWindowSize } from "@vueuse/core"

const FPS_30 = 1000 / 30;

export const useViewportSize = () => {
	const { width, height } = useWindowSize({
		initialWidth: window.innerWidth,
		initialHeight: window.innerHeight
	});
	const viewportWidth = throttledRef(width, FPS_30, true, false);
	const viewportHeight = throttledRef(height, FPS_30, true, false);

	return { viewportWidth, viewportHeight };
}