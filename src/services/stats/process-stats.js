import { formatBasicSortableDateKey, getNextDay, isNextDay, isSameDay } from "@/utils/date.utils.js";
import { puzzleHistoryTable } from "./db.js";

export async function getGameEndStats({ width, height, difficulty }) {
	let items;
	try {
		items = await puzzleHistoryTable.where('[width+height+difficulty]').equals([width, height, difficulty]).sortBy('timeElapsed');
	} catch (e) {
		console.warn('Could not retrieve puzzle history data for gameEnd stats.');
		console.warn(e);
		return { count: 0 };
	}
	if (!items || !items.length) return { count: 0 };

	const best = items[0].timeElapsed;
	const secondBest = items.length > 1 ? items[1].timeElapsed : null;
	const count = items.length;
	const totalTime = items.reduce((total, item) => total + item.timeElapsed, 0);
	const average = totalTime / count;
	return { best, secondBest, count, totalTime, average };
}

export function getDailyStreaks(dates = []) {
	if (!dates || !dates.length) return {};

	const streaks = [];
	let lastStreak = new DailyStreak(dates[0]);

	for (let i = 1; i < dates.length; i++) {
		let date = dates[i];
		const result = lastStreak.addTimestamp(date);

		if (!result) {
			streaks.push(lastStreak);
			lastStreak = new DailyStreak(date);
		}
	}

	const today = new Date();
	if (isSameDay(today, lastStreak.last) || isNextDay(lastStreak.last, today)) {
		// still open: can be done today
		streaks.push(lastStreak);
	} else {
		streaks.push(lastStreak.finish());
	}

	const longestStreak = streaks.reduce((acc, streak) => {
		return Math.max(acc, streak.length);
	}, 0);
	const hasCurrentStreak = lastStreak.end == null;
	const currentStreak = hasCurrentStreak ? lastStreak.length : 0;
	return { currentStreak, longestStreak };
}

export function getDailyStats(entries = []) {
	const dates = new Map();

	for (const item of entries) {
		const { date } = item;
		const dateKey = formatBasicSortableDateKey(date);
		if (!dates.has(dateKey)) {
			const summ = new DaySummary(dateKey);
			dates.set(dateKey, summ);
		}
		dates.get(dateKey).addPuzzle(item);
	}
	const allSummaries = [...dates.values()]
		.map(summ => summ.summarize())
		.sort((a, b) => {
			return a.date.localeCompare(b.date);
		});
	
	const startDateStr = allSummaries[0].date;
	const endDateStr = allSummaries[allSummaries.length - 1].date;

	const startDate = new Date(startDateStr);
	const endDate = new Date(endDateStr);

	for (let d = startDate; d <= endDate; d = getNextDay(d)) {
		const key = formatBasicSortableDateKey(d);
		if (dates.has(key)) continue;
		allSummaries.push({ date: key, ...new DaySummary(key).summarize() });
	}

	return allSummaries.sort((a, b) => {
		return a.date.localeCompare(b.date);
	});
}

class DaySummary {
	constructor(date) {
		this.date = date;
		this.puzzles = [];

		this.amount = 0;
		this.totalTime = 0;
	}

	addPuzzle(puzzle) {
		this.puzzles.push(puzzle);
		this.amount += 1;
		this.totalTime += puzzle.timeElapsed;
		return this;
	}

	summarize() {
		const { amount, date, totalTime } = this;
		const { puzzles } = this;
		
		const byDifficulty = new Map();
		const bySize = new Map();

		for (const puzzle of puzzles) {
			const { width, height } = puzzle;
			const sizeKey = `${width}x${height}`;
			if (!bySize.has(sizeKey)) {
				bySize.set(sizeKey, {
					amount: 0,
					totalTime: 0
				});
			}
			const bySizeObj = bySize.get(sizeKey);
			bySizeObj.amount += 1;
			bySizeObj.totalTime += puzzle.timeElapsed;

			const { difficulty } = puzzle;
			if (!byDifficulty.has(difficulty)) {
				byDifficulty.set(difficulty, {
					amount: 0,
					totalTime: 0
				});
			}
			const byDiffObj = byDifficulty.get(difficulty);
			byDiffObj.amount += 1;
			byDiffObj.totalTime += puzzle.timeElapsed;
		}

		return { amount, date, totalTime, byDifficulty, bySize };
	}
}

class DailyStreak {
	constructor(start) {
		this.start = start;
		
		this.dayTimestamps = [start];
		this.allTimestamps = [start];
		this.end = null;

		this._isFinished = false;
	}

	get last() {
		return this.allTimestamps[this.allTimestamps.length - 1];
	}

	get length() {
		return this.dayTimestamps.length;
	}

	finish() {
		this.end = this.last;
		this._isFinished = true;
		return this;
	}

	addTimestamp(timestamp) {
		if (this._isFinished) {
			console.warn('Streak is already finished, cant add any more timestamps.');
			return false;
		}

		const last = this.last;
		if (isSameDay(last, timestamp)) {
			this.allTimestamps.push(timestamp);
			return true;
		} else if (isNextDay(last, timestamp)) {
			this.allTimestamps.push(timestamp);
			this.dayTimestamps.push(timestamp);
			return true;
		}

		this.finish();
		return false;
	}
}