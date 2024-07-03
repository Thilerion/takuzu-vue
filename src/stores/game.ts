import { defineStore } from "pinia";
import { ref } from "vue";

export const useGameStore = defineStore('game', () => {
	// Used to force rerendering of the play puzzle page when the board is changed (such as when the user "plays again" after finishing a puzzle)
	const puzzleRefreshKey = ref(0);

	return { puzzleRefreshKey };
})