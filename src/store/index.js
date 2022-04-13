import { isDebugModeEnabledInLocalStorage, persistDebugMode } from "@/services/debug-mode.js";
import { createStore } from "vuex";

const debugModeEnabled = isDebugModeEnabledInLocalStorage({
	defaultValue: import.meta.env.DEV
});

const store = createStore({
	strict: import.meta.env.DEV,

	modules: {
	},

	state: {
		debugMode: debugModeEnabled,

		// TODO: pretty crappy way to force rerender, use something other than puzzleKey
		// to force playPuzzle route to rerender after "restart" game
		puzzleKey: 0,
	},

	getters: {

	},

	mutations: {
		setDebugMode: (state, value) => state.debugMode = !!value,
		incrementPuzzleKey: state => state.puzzleKey += 1,
	},

	actions: {
		setDebugMode({ commit }, enabled) {
			persistDebugMode(enabled);
			commit('setDebugMode', enabled);
		}
	}

})

export default store;