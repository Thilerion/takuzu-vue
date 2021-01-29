const getDefaultSettings = () => ({
	showBoardCoordinates: true,
	enableWakeLock: true,
	
	// vibration settings
	vibrationIntensity: 2, // 0 1 2 or 3, off low medium or high
	vibrateUI: true,
	vibrateGame: true,
	vibrateInfo: true,

});

export const settingsModule = {
	namespaced: true,
	state: loadSettings,

	getters: {
		vibrationEnabled: state => state.vibrationIntensity > 0,
		gameVibrationEnabled: (state, getters) => getters.vibrationEnabled && state.vibrateGame,
		uiVibrationEnabled: (state, getters) => getters.vibrationEnabled && state.vibrateUI,
		infoVibrationEnabled: (state, getters) => getters.vibrationEnabled && state.vibrateInfo,
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
		console.log('Store settings watcher: saving settings');
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
	console.log('watcher initiated');
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