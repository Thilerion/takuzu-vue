import { usePreferredColorScheme } from '@vueuse/core';
import { ref, watchEffect } from 'vue';

const autoColorScheme = usePreferredColorScheme();
const userColorScheme = ref('no-preference');

const THEME_STORAGE_KEY = 'takuzu-theme';
const htmlEl = document.querySelector('html');

const getUserColorScheme = () => {
	let value = localStorage.getItem(THEME_STORAGE_KEY);
	if (value == null || value == 'auto') {
		value = 'no-preference';
	}
	userColorScheme.value = value;
}
const setUserColorScheme = (value = 'no-preference') => {
	if (value === 'auto') {
		userColorScheme.value = 'no-preference';
	} else {
		userColorScheme.value = value;
	}
	localStorage.setItem(THEME_STORAGE_KEY, userColorScheme.value);
}

watchEffect(() => {
	if (userColorScheme.value === 'light') {
		htmlEl.classList.add('light');
		htmlEl.classList.remove('dark');
		return;
	} else if (userColorScheme.value === 'dark') {
		htmlEl.classList.add('dark');
		htmlEl.classList.remove('light');
		return;
	}

	if (autoColorScheme.value === 'dark') {
		htmlEl.classList.add('dark');
		htmlEl.classList.remove('light');
		return;
	} else {
		htmlEl.classList.add('light');
		htmlEl.classList.remove('dark');
		return;
	}
});

export const getThemePref = () => {
	return userColorScheme.value;
}

export function initTheme() {
	getUserColorScheme();
	return;
}
export function setTheme(value = 'auto') {
	setUserColorScheme(value);
	return;
}