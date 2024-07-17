import { initializeOrPopulatePregenPuzzles } from "./interface.js";

export async function initPregeneratedPuzzles(
) {
	window.setTimeout(() => {
		return initializeOrPopulatePregenPuzzles();
	}, 2000);
}