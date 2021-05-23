import { createStore } from 'vuex';
import gameModule from './game';
import puzzleModule from './puzzle';
import { settingsModule, initSettingsWatcher } from './settings';
import { statsModule } from './stats';

const store = createStore({

	strict: process.env.NODE_ENV !== 'production',

	modules: {
		game: gameModule,
		puzzle: puzzleModule,
		settings: settingsModule,
		stats: statsModule,
	},

	state: {
		devMode: !!localStorage.getItem('takuzu-dev-mode'),
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
		}
	},
  
	actions: {
		
	}

});

const unwatchSettings = initSettingsWatcher(store);

export default store;
