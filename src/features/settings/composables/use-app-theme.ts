import { useColorMode, type BasicColorMode } from "@vueuse/core";
import { computed, watch, type ComputedRef, type Plugin, type Ref, readonly, type InjectionKey, inject } from "vue";

export type AppThemeMode = 'light' | 'dark';
export type AppThemeModeSetting = AppThemeMode | 'auto';

const DEFAULT_APP_THEME_MODE_SETTING = 'auto' satisfies AppThemeModeSetting;
const STORAGE_KEY = 'takuzu_appThemeMode';

export interface AppThemeModeContext {
	setAppThemeModeUserPref: (value: AppThemeModeSetting) => void,
	resetAppThemeMode: () => void,

	userPref: Ref<AppThemeModeSetting>,
	system: ComputedRef<BasicColorMode>,
	appThemeMode: ComputedRef<AppThemeMode>,
	isDark: ComputedRef<boolean>,
	isLight: ComputedRef<boolean>,
}

const APP_THEME_MODE_INJECTION_KEY = Symbol('appThemeMode') as InjectionKey<AppThemeModeContext>;

// Plugin installation, provides theme preference data to the App.
export const themePreferencesPlugin: Plugin = {
	install(app) {
		const context = useInitAppThemeMode();
		app.provide(APP_THEME_MODE_INJECTION_KEY, context);
	}
}

const useInitAppThemeMode = (): AppThemeModeContext => {
	const colorMode = useColorMode<AppThemeMode>({
		storageKey: STORAGE_KEY,
		attribute: undefined,
		selector: undefined,
		initialValue: getDefaultInitialAppThemeMode(),
	});

	// UserPref is the stored user preference (auto, light, dark)
	const userPref: Ref<AppThemeModeSetting> = colorMode.store;
	// System is the current system preference (light, dark)
	const system: ComputedRef<BasicColorMode> = colorMode.system;
	// State is the current state of the app where a stored value !== auto overrides the system preference
	const state: ComputedRef<AppThemeMode> = colorMode.state;

	const isDark = computed(() => state.value === 'dark');
	const isLight = computed(() => state.value === 'light');

	watch(state, (newState) => {
		setAppThemeModeAttrs(newState, system.value);
	}, { immediate: true });

	const setAppThemeModeUserPref = (value: AppThemeModeSetting) => {
		console.log(`Setting user preferred color theme/base theme: ${value}`);
		userPref.value = value;
	}

	const resetAppThemeMode = () => {
		setAppThemeModeUserPref(DEFAULT_APP_THEME_MODE_SETTING);
	}

	const providedData: AppThemeModeContext = {
		setAppThemeModeUserPref,
		resetAppThemeMode,

		userPref: readonly(userPref),
		system,
		appThemeMode: state,

		isDark,
		isLight,
	}

	return providedData;
}

function setAppThemeModeAttrs(state: AppThemeMode, system: BasicColorMode) {
	if (!isValidAppThemeMode(state)) {
		console.warn(`Invalid appThemeMode: "${state}". Reverting to system value.`);
		state = system;
	}
	const isDark = state === 'dark';
	const isLight = state === 'light';

	document.documentElement.classList.toggle('dark', isDark);
	document.documentElement.classList.toggle('light', isLight);
	document.documentElement.dataset.baseTheme = state;
}

export const useAppThemeMode = () => {
	const providedData = inject(APP_THEME_MODE_INJECTION_KEY);
	if (providedData == null) {
		throw new Error('Cannot inject appThemeMode; it is not provided. Did the theme plugin not work?');
	}
	return providedData;
}

function isValidAppThemeMode(val: unknown): val is AppThemeMode {
	return typeof val === 'string' && ['light', 'dark'].includes(val as any);
}

function getDefaultInitialAppThemeMode(): AppThemeModeSetting {
	// Try the previously used storageKey first
	const persistedValue = localStorage.getItem('takuzu-theme');
	if (persistedValue != null && (persistedValue === 'auto' || isValidAppThemeMode(persistedValue))) {
		// If found, return this old value, and remove it from localStorage
		localStorage.removeItem('takuzu-theme');
		return persistedValue;
	}
	// If not found, use 'auto' instead
	return DEFAULT_APP_THEME_MODE_SETTING;
}