import { usePreferredColorScheme, useStorage } from "@vueuse/core";
import { computed, inject, provide, readonly, watchEffect } from "vue";

// set by script in index.html; this way the theme is immediately set
const {
	STORAGE_KEY = 'takuzu-theme',
	setBaseThemeAttrs
} = window.themePreferences ?? {};

const VALID_PREFERENCES = ['auto', 'light', 'dark'];
const VALID_COLOR_SCHEMES = ['light', 'dark'];
const COLOR_MODE_INJECTION_KEY = Symbol('color-mode-inject');
const DEFAULT_SCHEME = 'light';

export const useColorSchemeProvider = () => {
	const userPreference = useStorage(STORAGE_KEY, DEFAULT_SCHEME);
	const browserPreferred = usePreferredColorScheme();

	const colorTheme = computed(() => {
		if (userPreference.value === 'auto') {
			if (browserPreferred.value === 'light') return 'light';
			else if (browserPreferred.value === 'dark') return 'dark';
			else return DEFAULT_SCHEME;
		} else {
			return userPreference.value;
		}
	})

	const isDark = computed(() => colorTheme.value === 'dark');
	const isLight = computed(() => colorTheme.value === 'light');
	const isAuto = computed(() => userPreference.value === 'auto');

	watchEffect(() => {
		console.log(`Color theme changed to: "${colorTheme.value}"`);
		setBaseThemeAttrs(colorTheme.value);
	})

	const setColorTheme = (value) => {
		console.log('Setting user preferred color theme.');
		userPreference.value = value;
	}

	const setToDefault = () => setColorTheme(DEFAULT_SCHEME);

	provide(COLOR_MODE_INJECTION_KEY, {
		mode: readonly(userPreference), setColorTheme,
		isDark, isLight, isAuto, setToDefault,
		currentBrowserPreference: browserPreferred
	})

	return {
		mode: readonly(userPreference), setColorTheme,
		isDark, isLight, isAuto, setToDefault,
		currentBrowserPreference: browserPreferred
	};
}

export const useColorSchemePreference = () => {
	const { isDark, isLight, isAuto, mode, setColorTheme, setToDefault, currentBrowserPreference } = inject(COLOR_MODE_INJECTION_KEY);
	return { isDark, isLight, isAuto, mode, setColorTheme, setToDefault, currentBrowserPreference };
}