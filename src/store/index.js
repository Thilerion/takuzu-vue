import { createStore } from 'vuex';
import puzzleModule from './puzzle/index.js';
import { settingsModule, initSettingsWatcher } from './settings';
import { statsModule } from './stats';

const store = createStore({

	strict: process.env.NODE_ENV !== 'production',

	modules: {
		puzzle: puzzleModule,
		settings: settingsModule,
		stats: statsModule,
	},

	state: {
		devMode: !!localStorage.getItem('takuzu-dev-mode'),

		// to force playPuzzle route to rerender after "restart" game
		puzzleKey: 0,
	},
  
	getters: {

	},

	mutations: {
		setDevMode(state, value) {
			if (value) {
				state.devMode = true;
				localStorage.setItem('takuzu-dev-mode', true);
			} else {
				state.devMode = false;
				localStorage.removeItem('takuzu-dev-mode');
			}
		},
		incrementPuzzleKey: state => state.puzzleKey += 1,
	},
  
	actions: {
		
	}

});

const unwatchSettings = initSettingsWatcher(store);

export default store;
