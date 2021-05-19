import { isNextDay, isSameDay } from "@/utils/date.utils";
import { puzzleHistoryTable } from "./db";

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
	const count = items.length;
	const totalTime = items.reduce((total, item) => total + item.timeElapsed, 0);
	const average = totalTime / count;
	return { best, count, totalTime, average };
}

export function getDailyStreaks(dates = []) {
	if (!dates || !dates.length) return null;

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
	return {currentStreak, longestStreak};
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