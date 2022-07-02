import { EMPTY, ONE, ZERO } from "@/lib/constants";
import { useSettingsStore } from "@/stores/settings/store"
import { createSharedComposable } from "@vueuse/core";
import { computed, toRef } from "vue";

export const usePuzzleToggle = () => {
	const settingsStore = useSettingsStore();
	const mode = toRef(settingsStore, 'toggleMode');
	const order = computed(() => {
		if (mode.value === ZERO) {
			return [EMPTY, ZERO, ONE];
		} else if (mode.value === ONE) {
			return [EMPTY, ONE, ZERO];
		}
	})

	const toggle = (currentValue) => {
		const idx = order.value.indexOf(currentValue);
		const next = (idx + 1) % order.value.length;
		return order.value[next]
	}
	return { toggle };
}

export const useSharedPuzzleToggle = createSharedComposable(usePuzzleToggle);