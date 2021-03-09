const THEME_STORAGE_KEY = 'takuzu-theme';
const htmlEl = document.querySelector('html');

const matchMediaDark = window.matchMedia("(prefers-color-scheme: dark)");
const onMatchMediaChange = (e => {
	console.log('match media changed: ', e.matches);
	if (e.matches) {
		htmlEl.classList.add('dark');
	} else {
		htmlEl.classList.remove('dark');
	}
});
let isListening = false;
const listenForOSPrefChange = () => {
	if (isListening) return;
	matchMediaDark.addEventListener('change', onMatchMediaChange);
	isListening = true;
}
const stopListeningForOSPrefChange = () => {
	if (!isListening) return;
	matchMediaDark.removeEventListener('change', onMatchMediaChange);
	isListening = false;
}

const prefersColorSchemeDark = () => {
	return !!window.matchMedia('(prefers-color-scheme: dark)').matches;
}
export const getThemePref = () => {
	const result = localStorage.getItem(THEME_STORAGE_KEY);
	if (['dark', 'light', 'auto'].includes(result)) return result;
	return null;
}

export const setDarkTheme = () => {
	stopListeningForOSPrefChange();
	htmlEl.classList.add('dark');
	localStorage.setItem(THEME_STORAGE_KEY, 'dark');
}
export const setLightTheme = () => {
	stopListeningForOSPrefChange();
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
	listenForOSPrefChange();
	localStorage.setItem(THEME_STORAGE_KEY, 'auto');
}
export function initTheme() {
	const themePref = getThemePref();

	if (!themePref) {
		setTheme('light');
		return initTheme();
	}

	const isAuto = !themePref;

	if (themePref === 'dark' || isAuto && prefersColorSchemeDark()) {
		htmlEl.classList.add('dark');
	} else {
		htmlEl.classList.remove('dark');
	}

	if (isAuto) {
		listenForOSPrefChange();
	}
}
export function setTheme(value = 'auto') {
	if (!value) value = 'auto';
	const isAuto = value === 'auto';

	if (value === 'dark') {
		setDarkTheme();
	} else if (value === 'light') {
		setLightTheme();
	} else if (isAuto) {
		setThemeOSPref();
	} else {
		console.warn(`Unknown value for dark/light theme ("${value}"). Resetting to OS pref.`);
		setThemeOSPref();
	}
}