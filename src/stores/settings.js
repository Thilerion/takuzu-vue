import { defineStore } from 'pinia';
import { watch } from 'vue';

const getDefaultSettings = () => ({
	showLineInfo: '', // '' for disabled, 'coords', 'remainingCount', 'currentCount'
	enableWakeLock: true,
	showTimer: true,

	cellTheme: 'binary', // "blue-red" for colored, or "tictactoe"/"binary" for "symbols"
	
	enableVibration: true,
	vibrationStrength: 25,

	// assistance settings
	// automaticValidation: 'ruleViolations', // TODO: automatic validation, with values: disabled/ ruleViolations/ incorrectValues
	checkButton: 'incorrectValues',

	// input
	toggleMode: "0",
});

export const useSettingsStore = defineStore('settings', {
	state: loadSettings,

	getters: {
		vibrationEnabled: state => state.enableVibration,
		cellThemeType: state => cellThemeTypeMap[state.cellTheme],
		showBoardCoordinates: state => state.showLineInfo === 'coords',
		showBoardLineCounts: state => ['remainingCount', 'currentCount'].includes(state.showLineInfo),
		showRulers: state => !!state.showLineInfo,
	},

	actions: {
		saveToStorage(settings = this) {
			saveSettings(settings);
		}
	}
})

const cellThemeTypeMap = {
	'binary': 'symbols',
	'tictactoe': 'symbols',
	'blue-red': 'colored'
}

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

export function initSettingsWatcher(storeInstance) {
	watch(storeInstance, (value) => {
		console.log('saving settings state');
		saveSettings(value);
	})
	console.log('watcher initiated');
}