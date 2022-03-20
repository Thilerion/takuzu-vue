const MINUTE = 1000 * 60;

const TIME_RANGE_MIN_BOUNDS = {
	lower: MINUTE,
	upper: MINUTE * 10
};
const PLAYED_RANGE_MIN_BOUNDS = {
	lower: 1,
	upper: 6
}

export const mapScoreToArray = (score, arr) => {
	const idx = Math.ceil(score * arr.length) - 1;
	return arr[idx];
}

export const calculateScoresByDate = (itemsByDate, {
	timeMinBounds = TIME_RANGE_MIN_BOUNDS,
	playedMinBounds = PLAYED_RANGE_MIN_BOUNDS,
} = {}) => {
	const dateStatsByDate = getDateStatsByDate(itemsByDate);
	const {
		timeRange,
		playedRange
	} = getPlayedAndTimeRanges(Object.values(dateStatsByDate), {
		timeMinBounds, playedMinBounds
	});

	const result = {};

	for (const [dateStr, { played, time }] of Object.entries(dateStatsByDate)) {
		const playScore = getValueWithinRange(playedRange.min, played, playedRange.max);
		const timeScore = getValueWithinRange(timeRange.min, time, timeRange.max);
		const combinedScore = (0.3 * timeScore) + (0.7 * playScore);

		result[dateStr] = {
			played,
			time,
			playScore,
			timeScore,
			combinedScore
		}
	}
	return result;
}

const getDateStatsByDate = (itemsByDate) => {
	const result = {};
	for (const [dateStr, items] of Object.entries(itemsByDate)) {
		result[dateStr] = getDateStats(items);
	}
	return result;
}

const getDateStats = (items) => {
	const played = items.length;
	const time = items.reduce((acc, val) => acc + val.timeElapsed, 0);
	return { played, time };
}

const getPlayedAndTimeRanges = (dateStats, {
	timeMinBounds = TIME_RANGE_MIN_BOUNDS,
	playedMinBounds = PLAYED_RANGE_MIN_BOUNDS
} = {}) => {
	const timeRange = {
		min: Infinity,
		max: -Infinity
	}
	const playedRange = {
		min: Infinity,
		max: -Infinity
	};
	for (const { played, time } of Object.values(dateStats)) {

		timeRange.min = Math.min(timeRange.min, time);
		timeRange.max = Math.max(timeRange.max, time);
		playedRange.min = Math.min(playedRange.min, played);
		playedRange.max = Math.max(playedRange.max, played);
	}

	timeRange.min = Math.max(timeRange.min, timeMinBounds.lower);
	timeRange.max = Math.max(timeRange.max, timeMinBounds.upper);

	playedRange.min = Math.max(playedRange.min, playedMinBounds.lower);
	playedRange.max = Math.max(playedRange.max, playedMinBounds.upper);

	return { timeRange, playedRange };
}

const clamp = (min, value, max) => Math.min(Math.max(value, min), max);
const getValueWithinRange = (min, value, max) => {
	return clamp(
		0,
		(value - min) / (max - min),
		1
	)
}