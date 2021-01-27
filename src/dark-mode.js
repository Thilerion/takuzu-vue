const THEME_STORAGE_KEY = 'takuzu-theme';
const htmlEl = document.querySelector('html');

const prefersColorSchemeDark = () => {
	return !!window.matchMedia('(prefers-color-scheme: dark)').matches;
}
export const getThemePref = () => {
	const result = localStorage.getItem(THEME_STORAGE_KEY);
	if (result === 'dark' || result === 'light') return result;
	return null;
}

export const setDarkTheme = () => {
	htmlEl.classList.add('dark');
	localStorage.setItem(THEME_STORAGE_KEY, 'dark');
}
export const setLightTheme = () => {
	htmlEl.classList.remove('dark');
	localStorage.setItem(THEME_STORAGE_KEY, 'light');
}
export const setThemeOSPref = () => {
	const osPref = prefersColorSchemeDark();
	if (osPref) {
		htmlEl.classList.add('dark');
	} else {
		htmlEl.classList.remove('dark');
	}
	localStorage.removeItem(THEME_STORAGE_KEY);
}
export function initTheme() {
	const themePref = getThemePref();

	if (themePref === 'dark' || !themePref && prefersColorSchemeDark()) {
		htmlEl.classList.add('dark');
	} else {
		htmlEl.classList.remove('dark');
	}
}
export function setTheme(value) {
	if (value === 'dark') {
		setDarkTheme();
	} else if (value === 'light') {
		setLightTheme();
	} else if (!value) {
		setThemeOSPref();
	} else {
		console.warn(`Unknown value for dark/light theme ("${value}"). Resetting to OS pref.`);
		setThemeOSPref();
	}
}