import { puzzleDb } from '@/services/db/puzzles-db/init';
import { initPregenPuzzles } from './interface';

export async function initPregeneratedPuzzles(
	{ pregenTimeout = 2000 } = {}
) {
	const count = await puzzleDb.puzzles.count();
	if (count > 0) {
		// console.log('Starting pregen worker.');
		return new Promise((resolve) => {
			window.setTimeout(() => {
				initPregenPuzzles();
				resolve(true);
			}, pregenTimeout)
		})
	} else {
		console.log('Populating database with initial puzzles.');
		const initialPopulation = await import('@/services/db/puzzles-db/populate.js');
		return puzzleDb.populateWith(initialPopulation.default);
	}
}