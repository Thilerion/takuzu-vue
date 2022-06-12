import { autoResetRef, useStorage, useToggle } from "@vueuse/core";
import { computed } from "vue";

export const DEBUG_MODE_LS_KEY = 'takuzu_debug-mode';

const isEnabled = useStorage(
	DEBUG_MODE_LS_KEY,
	compatCheck() ?? import.meta.env.DEV,
	localStorage,
	{ writeDefaults: false }
);
const enableCounter = autoResetRef(0, 10000);
const immediateDebugModeToggle = useToggle(isEnabled);

export const useDebugMode = () => {

	const toggleDebugMode = (value, { immediate = false } = {}) => {
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

function compatCheck() {
	// TODO: removes old key from localstorage, for compatibility, 24/05/2022, can be removed later
	let value;
	try {
		const hasOld1 = localStorage.getItem('takuzu-debug-mode');
		if (hasOld1) {
			value = hasOld1;
			localStorage.removeItem('takuzu-debug-mode');
		}
		localStorage.removeItem('takuzu-dev-mode');
		return value;
	} catch(e) {}
}