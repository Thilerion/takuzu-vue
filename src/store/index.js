import { createStore } from 'vuex';
import gameModule from './game';

const store = createStore({

	strict: process.env.NODE_ENV !== 'production',

	modules: {
		game: gameModule
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

export default store;
