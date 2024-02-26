import { initializeOrPopulatePregenPuzzles } from "./interface";

export async function initPregeneratedPuzzles(
) {
	window.setTimeout(() => {
		return initializeOrPopulatePregenPuzzles();
	}, 2000);
}