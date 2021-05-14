import { puzzleHistoryDb, default as db } from './db';
import { PuzzleData } from './PuzzleData';

puzzleHistoryDb.mapToClass(PuzzleData);

// TODO: persistent storage (https://web.dev/persistent-storage/) to make sure data doesn't get deleted
// even better would be to sync data somewhere (firebase?) but that is something for the future

export const statsQueries = {
	numSolved() {
		return puzzleHistoryDb.count();
	},
	numSolvedWithDifficulty(value) {
		return puzzleHistoryDb.where('difficulty').equals(value).count();
	},
	numSolvedWithDimensions(width, height) {
		return puzzleHistoryDb.where('[width+height]').equals([width, height]).count();
	},
	getAll() {
		return puzzleHistoryDb.toArray();
	}
}

export const getGameEndStats = async ({ width, height, difficulty }) => {

	let items;

	try {
		items = await puzzleHistoryDb.where('[width+height+difficulty]').equals([width, height, difficulty]).sortBy('timeElapsed');
	} catch (e) {
		console.warn('Could not retrieve puzzle history data for gameEnd stats.');
		console.warn(e);
	}

	if (!items || !items.length) {
		return { count: 0 };
	}

	const result = {
		best: items[0].timeElapsed,
		timeSum: items.reduce((acc, item) => acc + item.timeElapsed, 0),
		count: items.length,
	}

	return {
		...result,
		average: (result.timeSum / result.count) || 0
	}
}


async function getSummaryKeys() {
	const result = await db.transaction('r', db.puzzleHistory, async () => {

		const sizes = puzzleHistoryDb.orderBy('[width+height]').uniqueKeys();
		const difficulties = puzzleHistoryDb.orderBy('difficulty').uniqueKeys();
		const sizeAndDifficulties = puzzleHistoryDb.orderBy('[width+height+difficulty]').uniqueKeys();

		return Promise.all([sizes, difficulties, sizeAndDifficulties]);
	});
	return result;
}

class StatsGroup {
	constructor(type, key) {
		this.type = type;
		this.key = key;

		this.times = [];
	}

	addItem(timeElapsed) {
		this.times.push(timeElapsed);
	}

	get played() {
		return this.times.length;
	}
	get totalTime() {
		return this.times.reduce((acc, val) => acc + val, 0);
	}
	get average() {
		return this.totalTime / this.played;
	}
	get best() {
		return Math.min(...this.times);
	}
	get worst() {
		return Math.max(...this.times);
	}

	toResult() {
		const { type, key, played, totalTime, average, best, worst } = this;
		return { type, key, played, totalTime, average, best, worst };
	}
}
export async function getAllStats() {
	const summary = {
		size: {},
		difficulty: {},
		sizeAndDifficulty: {}
	};
	let totalTime = 0;
	let totalPlayed = 0;

	const [sizes, difficulties, sizeAndDifficulties] = await getSummaryKeys();
	for (const sizeArr of sizes) {
		const size = sizeArr.join('x');
		summary.size[size] = new StatsGroup('size', size);
	}
	for (const difficulty of difficulties) {
		summary.difficulty[difficulty] = new StatsGroup('difficulty', difficulty);
	}
	for (const [w, h, difficulty] of sizeAndDifficulties) {
		const key = `${w}x${h}-${difficulty}`;
		summary.sizeAndDifficulty[key] = new StatsGroup('sizeAndDifficulty', key);
	}
	// console.log(summary);

	await puzzleHistoryDb.each(item => {
		const { width, height, difficulty, timeElapsed } = item;
		const size = `${width}x${height}`;
		const sizeAndDifficulty = `${size}-${difficulty}`;

		totalPlayed += 1;
		totalTime += timeElapsed;

		summary.size[size].addItem(timeElapsed);
		summary.difficulty[difficulty].addItem(timeElapsed);
		summary.sizeAndDifficulty[sizeAndDifficulty].addItem(timeElapsed);
	})
	
	const results = {};
	
	['size', 'difficulty', 'sizeAndDifficulty'].forEach((key) => {
		const summaryOfType = Object.values(summary[key]).map(s => s.toResult());
		results[key] = summaryOfType;
	})

	return { results, totalPlayed, totalTime };
}