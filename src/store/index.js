import { createStore } from 'vuex';
import gameModule from './game';
import { settingsModule, initSettingsWatcher } from './settings';

const store = createStore({

	strict: process.env.NODE_ENV !== 'production',

	modules: {
		game: gameModule,
		settings: settingsModule,
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

export default store;
