import { createSharedComposable, useDocumentVisibility } from "@vueuse/core"
import { computed } from "vue";

const localUsePageVisibility = () => {
	const visibilityState = useDocumentVisibility();
	const hidden = computed(() => visibilityState.value !== 'visible');
	const visible = computed(() => visibilityState.value === 'visible');

	return { visibilityState, hidden, visible };
}

export const usePageVisibility = createSharedComposable(localUsePageVisibility);