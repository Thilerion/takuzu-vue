import { useDocumentVisibility } from "@vueuse/core"
import { computed } from "vue";

export const usePageVisibility = () => {
	const visibilityState = useDocumentVisibility();
	const hidden = computed(() => visibilityState.value !== 'visible');
	const visible = computed(() => visibilityState.value === 'visible');

	return { visibilityState, hidden, visible };
}