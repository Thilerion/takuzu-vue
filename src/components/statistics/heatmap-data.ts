import type { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";

const MINUTE = 1000 * 60;

const TIME_RANGE_MIN_BOUNDS = {
	lower: MINUTE,
	upper: MINUTE * 10
};
const PLAYED_RANGE_MIN_BOUNDS = {
	lower: 1,
	upper: 6
}

export const mapScoreToArray = <T>(score: number, arr: T[]): T => {
	const idx = Math.ceil(score * arr.length) - 1;
	return arr[idx];
}

export const calculateScoresByDate = (itemsByDate: Record<string, StatsDbExtendedStatisticDataEntry[]>, {
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

	const result: Record<string, HeatmapDateStats & {
		playScore: number,
		timeScore: number,
		combinedScore: number
	}> = {};

	for (const [dateStr, { played, time }] of Object.entries(dateStatsByDate)) {
		const playScore = getValueWithinRange(playedRange.min, played, playedRange.max);
		const timeScore = getValueWithinRange(timeRange.min, time, timeRange.max);
		let combinedScore = (0.3 * timeScore) + (0.7 * playScore);

		if ((played > 0 || time > 0) && combinedScore === 0) {
			combinedScore = 0.001;
		}

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

export type HeatmapDateStats = { played: number, time: number };
export type HeatmapDateStatsDateMap = Record<string, HeatmapDateStats>;

const getDateStatsByDate = (itemsByDate: Record<string, StatsDbExtendedStatisticDataEntry[]>): Record<string, HeatmapDateStats> => {
	const result: Record<string, HeatmapDateStats> = {};
	for (const [dateStr, items] of Object.entries(itemsByDate)) {
		result[dateStr] = getDateStats(items);
	}
	return result;
}

const getDateStats = (items: StatsDbExtendedStatisticDataEntry[]): HeatmapDateStats => {
	const played = items.length;
	const time = items.reduce((acc, val) => acc + val.timeElapsed, 0);
	return { played, time };
}
export type HeatmapRange = { min: number, max: number };
const getPlayedAndTimeRanges = (dateStats: HeatmapDateStats[], {
	timeMinBounds = TIME_RANGE_MIN_BOUNDS,
	playedMinBounds = PLAYED_RANGE_MIN_BOUNDS
} = {}): { timeRange: HeatmapRange, playedRange: HeatmapRange } => {
	const timeRange = {
		min: Infinity,
		max: -Infinity
	}
	const playedRange = {
		min: Infinity,
		max: -Infinity
	};
	for (const { played, time } of dateStats) {

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

const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);
export const getValueWithinRange = (min: number, value: number, max: number) => {
	return clamp(
		0,
		(value - min) / (max - min),
		1
	)
}