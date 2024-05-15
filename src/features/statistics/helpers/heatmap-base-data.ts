import { formatBasicSortableDateKey, getWeekdayFromDate } from "@/utils/date.utils.js";
import { addDays, addHours, eachDayOfInterval, startOfDay, subYears } from "date-fns";

type DateParts = {
	year: number;
	month: number;
	weekday: number;
	day: number;
}
export type HeatmapRangeBaseCell = DateParts & {
	dayIndex: number;
	weekIndex: number;
	date: Date;
	dateStr: string;
}
export type HeatmapRange = {
	start: Date,
	end: Date,
}

export function createHeatmapRange(): HeatmapRange {
	const today = addHours(startOfDay(new Date()), 12);
	const oneYearAgo = addDays(subYears(today, 1), 2);
	return {
		start: oneYearAgo,
		end: today,
	};
}

export function createHeatmapRangeCells(range: HeatmapRange): HeatmapRangeBaseCell[] {
	const daysInInterval = eachDayOfInterval(range);

	// Iterate over each day in interval, and create a cell for each day
	// The first day is always in "weekIndex: 0" and "dayIndex: 0"
	// At each monday after the first day, increment weekIndex
	let weekIndex = 0;
	let dayIndex = 0;

	const result: HeatmapRangeBaseCell[] = [];

	for (const intDay of daysInInterval) {
		const weekday = getWeekdayFromDate(intDay) - 1;
		if (dayIndex > 0 && weekday === 0 /* monday */) {
			weekIndex += 1;
		}
		const cell: HeatmapRangeBaseCell = {
			year: intDay.getFullYear(),
			month: intDay.getMonth(),
			weekday: weekday,
			day: intDay.getDate(),
			dayIndex: dayIndex++,
			weekIndex,
			date: intDay,
			dateStr: formatBasicSortableDateKey(intDay),
		};
		result.push(cell);
	}

	return result;
}