import { defineStore } from "pinia";
import { toRaw } from "vue";
import { getDefaultSettings, loadSettings, saveSettings } from "./settings-ls";
import { cellThemeTypeMap, type SettingsState } from "./types";


export const useSettingsStore = defineStore<'settings', SettingsState>('settings', {
	state: loadSettings,

	getters: {
		vibrationEnabled: state => state.enableVibration,
		cellThemeType: state => cellThemeTypeMap[state.cellTheme],
		showBoardCoordinates: state => state.showLineInfo === 'coords',
		showBoardLineCounts: state => state.showLineInfo === 'currentCount' || state.showLineInfo === 'remainingCount',
		showRulers: state => state.showLineInfo !== '' && state.showLineInfo !== null,
	},
	actions: {
		saveToStorage() {
			const state: SettingsState = toRaw(this.$state);
			saveSettings(state);
		},
		resetToDefaults() {
			const defaults = getDefaultSettings();
			Object.assign(this.$state, defaults);
		}
	}
})

export function initSettingsPersistence() {
	const store = useSettingsStore();
	store.$subscribe((_mutation, state) => {
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