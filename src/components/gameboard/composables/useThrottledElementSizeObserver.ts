import { useResizeObserver, type MaybeComputedElementRef, type MaybeElement, throttledRef } from "@vueuse/core";
import { ref, type Ref } from "vue";

type ElementDimensions = { width: number, height: number };
type UseThrottledElementSizeObserverThrottleOpts = {
	delay: number,
	leading: boolean,
	trailing: boolean,
}

export const useThrottledElementSizeObserver = (
	elementRef: MaybeComputedElementRef<MaybeElement>,
	throttleOpts?: Partial<UseThrottledElementSizeObserverThrottleOpts>,
	defaultDimensions?: ElementDimensions,
): Ref<{ width: number, height: number }> => {
	const dimensions = ref({
		width: defaultDimensions ? defaultDimensions.width : 0,
		height: defaultDimensions ? defaultDimensions.height : 0
	});

	useResizeObserver(elementRef, (entries) => {
		try {
			const entry = entries[0];
			if (entry.contentBoxSize) {
				const { inlineSize, blockSize } = entry.contentBoxSize[0];
				dimensions.value = { width: inlineSize, height: blockSize };
			} else {
				const { width, height } = entry.contentRect;
				dimensions.value = { width, height };
			}
		} catch (e) {
			console.warn('Error in resize observer entries');
		}
	})

	const {
		delay = 500,
		leading,
		trailing
	} = throttleOpts || {};

	const throttledDimensions = throttledRef(
		dimensions,
		delay,
		trailing,
		leading
	);

	return throttledDimensions;
}