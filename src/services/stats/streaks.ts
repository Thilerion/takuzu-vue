import { differenceInCalendarDays } from "date-fns";

const createLongestStreak = (streaks = []) => {
	return streaks.reduce((acc, val) => {
		const length = val.length;
		if (length < acc.length) return acc;

		return {
			length,
			from: val[length - 1],
			to: val[0],
		}
	}, { length: 0, from: null, to: null });
}

const createCurrentStreak = (streaks = []) => {
	if (!streaks.length) {
		return {
			length: 0,
			from: null,
			active: false
		}
	}

	const mostRecent = streaks[streaks.length - 1];
	const mostRecentDate = mostRecent[0];
	const diff = Math.abs(differenceInCalendarDays(
		new Date(),
		mostRecentDate
	));

	if (diff > 1) {
		return {
			length: 0,
			from: null,
			active: false
		}
	}
	return {
		length: mostRecent.length,
		from: mostRecent[mostRecent.length - 1],
		active: diff === 0
	}
}

export function processDateStreaks(uniqueDates = []) {
	if (!uniqueDates.length) {
		return {
			longest: createLongestStreak(),
			current: createCurrentStreak()
		}
	}

	// most recent first
	const sortedDates = [...uniqueDates].sort((a, b) => a < b ? 1 : a > b ? -1 : 0);

	let prevDate = sortedDates[0];
	const streaks = [
		[prevDate]
	];

	for (let i = 1; i < sortedDates.length; i++) {
		const cur = sortedDates[i];
		const daysDiff = Math.abs(differenceInCalendarDays(prevDate, cur));

		if (daysDiff > 1) {
			streaks.unshift([cur]);
		} else if (daysDiff === 1) {
			streaks[0].push(cur);
		} else {
			throw new Error('Should be unreachable, diff is not 1 or higher than 1?');
		}
		prevDate = cur;
	}

	return {
		longest: createLongestStreak(streaks),
		current: createCurrentStreak(streaks)
	}
}