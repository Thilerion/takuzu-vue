const getDefaultSettings = () => ({
	showLineInfo: '', // '' for disabled, 'coords', 'remainingCount', 'currentCount'
	enableWakeLock: true,
	showTimer: true,

	cellTheme: 'binary', // "blue-red" for colored, or "tictactoe"/"binary" for "symbols"
	
	enableVibration: true,

	// assistance settings
	// automaticValidation: 'ruleViolations', // TODO: automatic validation, with values: disabled/ ruleViolations/ incorrectValues
	checkButton: 'incorrectValues',

	// input
	toggleMode: "0",
});

const cellThemeTypeMap = {
	'binary': 'symbols',
	'tictactoe': 'symbols',
	'blue-red': 'colored'
}

export const settingsModule = {
	namespaced: true,
	state: loadSettings,

	getters: {
		vibrationEnabled: state => state.enableVibration,

		cellThemeType: state => cellThemeTypeMap[state.cellTheme],

		showBoardCoordinates: state => state.showLineInfo === 'coords',
		showBoardLineCounts: state => ['remainingCount', 'currentCount'].includes(state.showLineInfo),
		showRulers: state => !!state.showLineInfo,
		boardHasLineInfoPadding: state => state.showLineInfo !== '',
	},

	mutations: {
		setSetting(state, { key, value }) {
			state[key] = value;
		}
	},

	actions: {
		saveToStorage({ }, settings) {
			saveSettings(settings);
		}
	}
};

export const initSettingsWatcher = (store) => {
	const watchFn = (state) => state.settings;
	const watchCb = (settings) => {
		// console.log('Store settings watcher: saving settings');
		saveSettings(settings);
	}
	const opts = {
		deep: true,
		immediate: true
	}
	const watcher = store.watch(
		watchFn,
		watchCb,
		opts
	);
	// console.log('watcher initiated');
	return watcher;
}

function loadSettings() {
	const defaultSettings = getDefaultSettings();
	try {
		const data = window.localStorage.getItem('takuzu-settings');
		if (!data) {
			throw new Error('No settings data in localStorage.');
		}
		const parsed = JSON.parse(data);
		const result = {};
		for (const key of Object.keys(defaultSettings)) {
			result[key] = parsed[key] ?? defaultSettings[key];
		}
		if (result.cellTheme === 'colored') {
			result.cellTheme = 'blue-red';
		}
		return result;
	} catch {
		console.warn('Could not load settings from LocalStorage. Setting defaults.');
		return defaultSettings;
	}
}
function saveSettings(value) {
	const json = JSON.stringify(value);
	window.localStorage.setItem('takuzu-settings', json);
}