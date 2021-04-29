import { createStore } from 'vuex';
import gameModule from './game';
import { settingsModule, initSettingsWatcher } from './settings';
import { statsModule, initStatsWatcher } from './stats';

const store = createStore({

	strict: process.env.NODE_ENV !== 'production',

	modules: {
		game: gameModule,
		settings: settingsModule,
		stats: statsModule,
	},

	state: {
			
	},
  
	getters: {

	},

	mutations: {

	},
  
	actions: {
		
	}

});

const unwatchSettings = initSettingsWatcher(store);
const unwatchStats = initStatsWatcher(store);

export default store;
