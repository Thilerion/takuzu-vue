import { useDocumentVisibility } from '@vueuse/core';
import { computed } from 'vue';

export function usePageVisibility() {
	const visibility = useDocumentVisibility();

	const hidden = computed(() => visibility.value !== 'visible');
	const visible = computed(() => visibility.value === 'visible');

	return {
		visibility,
		hidden,
		visible
	}
}