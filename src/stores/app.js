import { isDebugModeEnabledInLocalStorage, persistDebugMode } from "@/services/debug-mode.js";
import { defineStore } from "pinia";

export const useAppStore = defineStore('app', {

	state: () => ({
		debugMode: isDebugModeEnabledInLocalStorage({
			defaultValue: import.meta.env.DEV
		}),
		// to force rerender after starting a new game when previous one has finished
		puzzleKey: 0,
	}),

	actions: {
		setDebugMode(enable) {
			const value = !!enable;
			persistDebugMode(value);
			this.debugMode = value;
		}
	}
})