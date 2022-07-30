import { differenceInCalendarDays } from "date-fns";

export type Streak = Date[];
export type DateStreaks = Streak[];
interface StreakLength {
	length: number,
	from: Date,
	to: Date
}
interface StreakLengthNone {
	length: 0,
	from: null,
	to: null
}
type StreakLengthResult = StreakLength | StreakLengthNone;
interface CurrentStreakTrue {
	length: number,
	from: Date,
	active: boolean
}
interface CurrentStreakFalse {
	length: 0,
	from: null,
	active: false
}
type CurrentStreakResult = CurrentStreakTrue | CurrentStreakFalse;

const createLongestStreak = (streaks: DateStreaks = []): StreakLengthResult => {
	if (!streaks || !streaks.length) {
		return {
			length: 0,
			from: null,
			to: null
		} as const;
	}
	const base = { length: 0, from: null, to: null } as StreakLengthResult;
	return streaks.reduce((acc, val) => {
		const length = val.length;
		if (length < acc.length) return acc;

		return {
			length,
			from: val[length - 1],
			to: val[0],
		}
	}, base);
}

const createCurrentStreak = (streaks: DateStreaks = []): CurrentStreakResult => {
	if (!streaks.length) {
		return {
			length: 0,
			from: null,
			active: false
		} as const;
	}

	const mostRecentStreak: Streak = streaks[streaks.length - 1];
	const mostRecentDate: Date = mostRecentStreak[0];
	const diff = Math.abs(differenceInCalendarDays(
		new Date(),
		mostRecentDate
	));

	if (diff > 1) {
		return {
			length: 0,
			from: null,
			active: false
		} as const;
	}
	return {
		length: mostRecentStreak.length,
		from: mostRecentStreak[mostRecentStreak.length - 1],
		active: diff === 0
	}
}

export function processDateStreaks(uniqueDates: Date[] = []) {
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