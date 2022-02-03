// const { createStore } = require("vuex");

// import { isDevModeEnabledInLocalStorage } from "@/services/dev-mode.js";
import { createStore } from "vuex";
import puzzleModule from './puzzle/index.js';
import { settingsModule, initSettingsWatcher } from './settings.js';
import { statsModule } from './stats.js';
import { statsDataModule } from './stats-data.js';

const setDebugMode = (state, value) => {
	state.debugMode = state.devMode = !!value;

	if (value) {
		localStorage.setItem('takuzu-dev-mode', true);
	} else {
		localStorage.removeItem('takuzu-dev-mode');
	}
}

const store = createStore({
	strict: import.meta.env.DEV,

	modules: {
		puzzle: puzzleModule,
		settings: settingsModule,
		stats: statsModule,
		statsData: statsDataModule,
	},

	state: {
		devMode: import.meta.env.DEV, // TODO: replace devMode with debugMode
		debugMode: import.meta.env.DEV,
		// TODO: pretty crappy way to force rerender, use something other than puzzleKey
		// to force playPuzzle route to rerender after "restart" game
		puzzleKey: 0,
	},

	getters: {

	},

	mutations: {
		setDevMode: setDebugMode,
		setDebugMode,
		incrementPuzzleKey: state => state.puzzleKey += 1,
	},

	actions: {

	}

})

const unwatchSettings = initSettingsWatcher(store);

export default store;