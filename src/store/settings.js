export const settingsModule = {
	namespaced: true,
	state: {},

	getters: {
		
	},

	mutations: {
		
	},

	actions: {
		
	}
};

export const initSettingsWatcher = (store) => {
	console.warn('old init settings watcher called');
}

function loadSettings() {
	console.warn('old load settings called');
}
function saveSettings(value) {
	console.warn('old save settings called');
}