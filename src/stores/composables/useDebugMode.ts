import { autoResetRef, useStorage, useToggle } from "@vueuse/core";
import { computed } from "vue";

export const DEBUG_MODE_LS_KEY = 'takuzu_debug-mode';

const isEnabled = useStorage(
	DEBUG_MODE_LS_KEY,
	getInitialValue(),
	localStorage,
	{ writeDefaults: true }
);
const enableCounter = autoResetRef(0, 10000);
const immediateDebugModeToggle = useToggle(isEnabled);

export const useDebugMode = () => {

	const toggleDebugMode = (value: boolean, { immediate = false } = {}) => {
		if (!value || (value && immediate)) {
			return immediateDebugModeToggle(value);
		} else {
			enableCounter.value += 1;
			if (enableCounter.value >= 5) {
				enableCounter.value = 0;
				return immediateDebugModeToggle(true);
			}
			return isEnabled.value;
		}
	}

	const enabled = computed(() => {
		if (isEnabled.value) return true;
		return false;
	})

	return { toggleDebugMode, enabled };
}

function getInitialValue(): boolean {
	const isDev: boolean = import.meta.env.DEV;
	return !!isDev;
}