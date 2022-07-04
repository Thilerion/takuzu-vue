import { useMediaQuery } from "@vueuse/core";
import { computed } from "vue";

export const useDeviceOrientation = () => {
	const isLandscape = useMediaQuery('(orientation: landscape)');
	const isPortrait = useMediaQuery('(orientation: portrait)');
	const orientation = computed(() => {
		if (isLandscape.value) {
			return 'landscape';
		} else if (isPortrait.value) {
			return 'portrait';
		} else {
			return 'unknown';
		}
	})

	return { isLandscape, isPortrait, orientation };
}