import { usePreferredDark, useStorage } from "@vueuse/core";
import { computed, inject, provide, readonly, watchEffect } from "vue";

const defaultOptions = {
	valueDark: 'dark',
	valueLight: 'light',
	valueAuto: 'auto',
	storageKey: 'takuzu-theme',
	listenToStorageChanges: true
};

export function initDarkLightAutoTheme(opts = {}) {
	const { storageKey, valueDark, valueLight, valueAuto, listenToStorageChanges } = {
		...defaultOptions,
		...opts
	};

	const preferredDark = usePreferredDark();
	const state = useStorage(storageKey, valueAuto, window.localStorage, {
		listenToStorageChanges
	});

	const isDark = computed(() => (state.value === valueDark) || (state.value === valueAuto && preferredDark.value));
	const isLight = computed(() => (state.value === valueLight) || (state.value === valueAuto && !preferredDark.value));
	const isAuto = computed(() => state.value === valueAuto);

	const onChanged = (value, prevValue) => {
		console.log('isDark changed!', { value, prevValue });
		const el = document.querySelector('html');
		el.classList.toggle(valueDark, value);
		el.classList.toggle(valueLight, !value);
	}

	watchEffect(() => {
		onChanged(isDark.value);
	}, { flush: 'post' });

	const setDarkLightTheme = (value) => state.value = value;

	provide('darkLightTheme', {
		isDark, isLight, isAuto,
		setTheme: setDarkLightTheme,
		value: state
	});

	return { isDark, isLight, isAuto, themeValue: state, setTheme: setDarkLightTheme };
}

export function useDarkLightAutoTheme() {
	const { isDark, isLight, isAuto, setTheme, value } = inject('darkLightTheme');
	return { isDark, isLight, isAuto, setTheme, value: readonly(value) };
}