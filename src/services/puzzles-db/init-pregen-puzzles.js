import { initPregenWorker } from '@/workers/pregen-puzzles.js';
import { puzzleDb } from './db.js';

export async function initPregeneratedPuzzles(
	{ pregenTimeout = 2000 } = {}
) {
	const count = await puzzleDb.puzzles.count();
	if (count > 0) {
		console.log('Starting pregen worker.');
		return new Promise((resolve) => {
			window.setTimeout(() => {
				initPregenWorker();
				resolve();
			}, pregenTimeout)
		})
	} else {
		console.log('Populating database with initial puzzles.');
		const initialPopulation = await import('./populate-pregen-puzzles.js');
		return puzzleDb.puzzles.bulkPut(initialPopulation.default.map(item => {
			return {...item, populated: true}
		}));
	}
}