const getDefaultSettings = () => ({
	showBoardCoordinates: true
});

const loadSettings = () => {
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
const saveSettings = (value) => {
	const json = JSON.stringify(value);
	window.localStorage.setItem('takuzu-settings', json);
}

export const settingsModule = {
	namespaced: true,
	state: loadSettings,

	getters: {

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