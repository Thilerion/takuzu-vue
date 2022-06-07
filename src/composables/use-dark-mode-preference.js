import { usePreferredColorScheme, useStorage } from "@vueuse/core";
import { computed, inject, provide, readonly, watchEffect } from "vue";

const VALID_PREFERENCES = ['auto', 'light', 'dark'];
const VALID_COLOR_SCHEMES = ['light', 'dark'];
const COLOR_MODE_INJECTION_KEY = Symbol('color-mode-inject');
const STORAGE_KEY = 'takuzu-theme';
const DEFAULT_SCHEME = 'light';

export const useColorSchemeProvider = () => {
	const userPreference = useStorage(STORAGE_KEY, DEFAULT_SCHEME);
	const browserPreferred = usePreferredColorScheme();
	
	const htmlEl = document.querySelector('html');

	const colorTheme = computed(() => {
		if (userPreference.value === 'auto') {
			if (browserPreferred.value === 'light') return 'light';
			else if (browserPreferred.value === 'dark') return 'dark';
			else return DEFAULT_SCHEME;
		} else {
			return userPreference.value;
		}
	})

	watchEffect(() => {
		console.log(`Color theme changed to: "${colorTheme.value}"`);
		const enable = colorTheme.value;
		const disable = enable === 'light' ? 'dark' : 'light';
		htmlEl.classList.add(enable);
		htmlEl.classList.remove(disable);
	})

	const setColorTheme = (value) => {
		console.log('Setting user preferred color theme.');
		userPreference.value = value;
	}

	const isDark = computed(() => colorTheme.value === 'dark');
	const isLight = computed(() => colorTheme.value === 'light');
	const isAuto = computed(() => userPreference.value === 'auto');

	const setToDefault = () => setColorTheme(DEFAULT_SCHEME);

	provide(COLOR_MODE_INJECTION_KEY, {
		mode: readonly(userPreference), setColorTheme,
		isDark, isLight, isAuto, setToDefault
	})

	return {
		mode: readonly(userPreference), setColorTheme,
		isDark, isLight, isAuto, setToDefault
	};
}

export const useColorSchemePreference = () => {
	const { isDark, isLight, isAuto, mode, setColorTheme, setToDefault } = inject(COLOR_MODE_INJECTION_KEY);
	return { isDark, isLight, isAuto, mode, setColorTheme, setToDefault };
}