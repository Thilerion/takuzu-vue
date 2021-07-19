import { puzzleHistoryTable, default as db } from './db';
import { PuzzleData } from './models';
import { getDailyStats, getDailyStreaks } from './process-stats';

export * from './process-stats';
export { PuzzleData, puzzleHistoryTable, db };
export { clearPuzzleHistory, exportPuzzleHistory, importPuzzleHistory } from './db';

puzzleHistoryTable.mapToClass(PuzzleData);

// TODO: persistent storage (https://web.dev/persistent-storage/) to make sure data doesn't get deleted
// even better would be to sync data somewhere (firebase?) but that is something for the future


async function getSummaryKeys() {
	const result = await db.transaction('r', db.puzzleHistory, async () => {

		const sizes = puzzleHistoryTable.orderBy('[width+height]').uniqueKeys();
		const difficulties = puzzleHistoryTable.orderBy('difficulty').uniqueKeys();
		const sizeAndDifficulties = puzzleHistoryTable.orderBy('[width+height+difficulty]').uniqueKeys();

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
	const allItems = [];
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

	let dates = [];

	await puzzleHistoryTable.each(item => {
		allItems.push(item);
		const { width, height, difficulty, timeElapsed, date } = item;
		const size = `${width}x${height}`;
		const sizeAndDifficulty = `${size}-${difficulty}`;

		totalPlayed += 1;
		totalTime += timeElapsed;

		summary.size[size].addItem(timeElapsed);
		summary.difficulty[difficulty].addItem(timeElapsed);
		summary.sizeAndDifficulty[sizeAndDifficulty].addItem(timeElapsed);

		dates.push(new Date(date));
	})

	if (!allItems.length) {
		return { results: {}, totalPlayed: 0, totalTime: 0, currentStreak: 0, longestStreak: 0, dailyStats: [], allItems: [] };
	}
	
	const results = {};
	
	['size', 'difficulty', 'sizeAndDifficulty'].forEach((key) => {
		const summaryOfType = Object.values(summary[key]).map(s => s.toResult());
		results[key] = summaryOfType;
	})

	const sortedDates = [...dates].sort((a, b) => a < b ? -1 : a === b ? 0 : 1);	
	const { currentStreak, longestStreak } = getDailyStreaks(sortedDates);
	const dailyStats = getDailyStats(allItems);

	return { results, totalPlayed, totalTime, currentStreak, longestStreak, dailyStats, allItems };
}