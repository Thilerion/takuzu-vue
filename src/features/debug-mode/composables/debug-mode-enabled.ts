import { autoResetRef, createSharedComposable, useStorage } from "@vueuse/core";
import { readonly } from "vue";

const LS_KEY = 'takuzu_debug-mode';
const defaultEnabled = () => {
	const isDev = import.meta.env.DEV;
	return !!isDev;
}

const CLICKS_TO_ENABLE = 5;

export const useDebugMode = createSharedComposable(() => {
	const isEnabled = useStorage<boolean>(
		LS_KEY,
		defaultEnabled(),
		localStorage,
		{ writeDefaults: true }
	)

	const disable = (): false => isEnabled.value = false;
	const enable = (): true => isEnabled.value = true;
	const toggle = (value?: boolean): boolean => {
		value = value ?? !isEnabled.value;
		if (value) {
			return enable();
		} else {
			return disable();
		}
	}


	// If not incremented within 10s, the counter resets
	const enableCounter = autoResetRef(0, 10000);
	const toggleWithCounter = (value: boolean): boolean => {
		if (!value) {
			// Disabling happens immediately
			return disable();
		}
		enableCounter.value += 1;
		if (enableCounter.value >= CLICKS_TO_ENABLE) {
			enableCounter.value = 0;
			return enable();
		}
		return isEnabled.value;
	}

	return {
		toggle,
		toggleWithCounter,
		enabled: readonly(isEnabled)
	}
});

export const useIsDebugModeEnabled = () => {
	const { enabled } = useDebugMode();
	return enabled;
}