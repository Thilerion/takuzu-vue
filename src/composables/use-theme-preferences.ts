import { usePreferredColorScheme, useStorage } from "@vueuse/core";
import { computed, inject, provide, readonly, watchEffect, type ComputedRef } from "vue";
import type { InjectionKey } from 'vue'

export const BASE_THEMES = {
	dark: 'dark',
	light: 'light'
} as const;
const DEFAULT_BASE_THEME = BASE_THEMES.light;

export type BaseTheme = keyof typeof BASE_THEMES;
export type BaseThemeUserPref = BaseTheme | 'auto';

type WindowBaseThemePreferences = {
	STORAGE_KEY: string;
	setBaseThemeAttrs: (baseTheme: BaseTheme) => void;
}
declare global {
	interface Window {
		themePreferences: WindowBaseThemePreferences
	}
}

export interface BaseThemeProvidedData {
	isDark: ComputedRef<boolean>;
	isLight: ComputedRef<boolean>;
	baseThemeIsAuto: ComputedRef<boolean>;
	setBaseThemePreference: (v: BaseThemeUserPref) => void;
	setBaseThemeDefault: () => void;
	baseThemeUserPref: ComputedRef<BaseThemeUserPref>;
	baseThemeBrowserPref: ComputedRef<BaseTheme>;
	baseTheme: ComputedRef<BaseTheme>;
}

export const BASE_THEME_INJECTION_KEY = Symbol('base-theme-inject') as InjectionKey<BaseThemeProvidedData>;

// set by script in index.html; this way the theme is immediately set
const {
	STORAGE_KEY = 'takuzu-theme',
	setBaseThemeAttrs
} = window.themePreferences;

export const useInitThemePreferenceProvider = (): BaseThemeProvidedData => {
	const baseThemeUserPref = useStorage<BaseThemeUserPref>(STORAGE_KEY, DEFAULT_BASE_THEME, localStorage);
	const preferredColorScheme = usePreferredColorScheme();
	const baseThemeBrowserPref = computed(() => {
		if (preferredColorScheme.value === 'no-preference') {
			return DEFAULT_BASE_THEME;
		} else return preferredColorScheme.value;
	})

	const baseTheme = computed(() => {
		if (baseThemeUserPref.value === 'auto') {
			return baseThemeBrowserPref.value;
		}
		return baseThemeUserPref.value;
	})

	const isDark = computed(() => baseTheme.value === 'dark');
	const isLight = computed(() => baseTheme.value === 'light');
	const baseThemeIsAuto = computed(() => baseThemeUserPref.value === 'auto');

	watchEffect(() => {
		console.log(`Color theme changed to: "${baseTheme.value}"`);
		setBaseThemeAttrs(baseTheme.value);
	})

	const setBaseThemePreference = (value: BaseThemeUserPref) => {
		console.log(`Setting user preferred color theme/base theme: ${value}`);
		baseThemeUserPref.value = value;
	}
	const setBaseThemeDefault = () => setBaseThemePreference(DEFAULT_BASE_THEME);

	const baseThemeProvidedData = {
		setBaseThemePreference,
		setBaseThemeDefault,
		isDark,
		isLight,
		baseThemeIsAuto,

		baseThemeUserPref: computed(() => baseThemeUserPref.value),
		baseTheme,
		baseThemeBrowserPref
	}

	provide(BASE_THEME_INJECTION_KEY, baseThemeProvidedData);

	return baseThemeProvidedData;
}

export const useThemePreferences = () => {
	const providedData = inject(BASE_THEME_INJECTION_KEY) as BaseThemeProvidedData;
	return providedData;
}