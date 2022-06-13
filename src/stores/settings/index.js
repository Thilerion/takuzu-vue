import { defineStore } from 'pinia';
import { CellThemes, CellThemeTypeMap, CheckButtonOption, rulerType, validVibrationStrengths } from './options';

const getDefaultSettings = () => ({
	showLineInfo: rulerType.COUNT_REMAINING,
	enableWakeLock: true,
	showTimer: true,

	cellTheme: CellThemes.CLASSIC, // "blue-red" for colored, or "tictactoe"/"classic/binary" for "symbols"
	
	enableVibration: true,
	vibrationStrength: validVibrationStrengths[2],

	// assistance settings
	// automaticValidation: 'ruleViolations', // TODO: automatic validation, with values: disabled/ ruleViolations/ incorrectValues
	checkButton: CheckButtonOption.INCORRECT_VALUES,

	// input
	toggleMode: "0",
});

export const useSettingsStore = defineStore('settings', {
	state: loadSettings,

	getters: {
		vibrationEnabled: state => state.enableVibration,
		cellThemeType: state => CellThemeTypeMap[state.cellTheme],
		showBoardCoordinates: state => state.showLineInfo === rulerType.COORDS,
		showBoardLineCounts: state => [rulerType.COUNT_CURRENT, rulerType.COUNT_REMAINING].includes(state.showLineInfo),
		showRulers: state => !!state.showLineInfo,
	},

	actions: {
		saveToStorage(settings = this) {
			saveSettings(settings);
		},
		resetToDefaults() {
			this.$patch({
				...getDefaultSettings()
			})
		}
	}
})

function loadSettings() {
	const settingsObj = getDefaultSettings();
	try {
		const data = window.localStorage.getItem('takuzu-settings');
		if (!data) return settingsObj;

		const parsed = JSON.parse(data);
		for (const key of Object.keys(settingsObj)) {
			const parsedHasKey = !!(key in parsed);
			if (!parsedHasKey) continue;
			settingsObj[key] = parsed[key];
		}
	} catch (e) {
		console.warn('An error occurred while trying to load settings from storage.');
		console.error(e);
	}
	return settingsObj;
}

function saveSettings(data) {
	const json = JSON.stringify(data);
	window.localStorage.setItem('takuzu-settings', json);
}

export function initSettingsPersistence() {
	const store = useSettingsStore();
	store.$subscribe((mutation, state) => {
		try {
			saveSettings(state);
		} catch (e) {
			console.warn('Error while trying to persist settings to localstorage');
			console.error(e);
		}
	})
	console.log('Subscribed to settings state.');
	return store;
}