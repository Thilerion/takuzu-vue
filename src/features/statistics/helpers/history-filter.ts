import type { DifficultyKey, DimensionStr } from "@/lib/types.js";
import type { HistoryListRecordsLists } from "../composables/history-list-records.js";
import type { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";

export type HistoryDifficultyFilter = DifficultyKey | null;
export type HistoryDimensionsFilter = DimensionStr | /* DimensionStr[] |  */null;
export type HistoryFavoriteFilter = true | null;
export type HistoryRecordFilter = 'time-current' | 'time-all' | 'first' | null;

export type HistoryFilterData = {
	/** Filter by difficulty, or null if no filter */
	difficulty: HistoryDifficultyFilter;
	/** Filter by one or multiple dimensions, or null if no filter */
	dimensions: HistoryDimensionsFilter;
	/** Show only favorites, or null if no filter */
	favorite: HistoryFavoriteFilter;
	/** Show only puzzles with a specific record type (timeRecord: current or all; first time played) or null if no filter */
	records: HistoryRecordFilter;
};

type FilterableItem = {
	difficulty: DifficultyKey;
	dimensions: DimensionStr;
	flags?: {
		favorite?: boolean | 1 | 0;
	},
	id?: StatsDbExtendedStatisticDataEntry['id']
}
type FilterFn = (item: FilterableItem, ctx: { records: HistoryListRecordsLists }) => boolean;
const identity: FilterFn = () => true;

function getDifficultyFilter(value: HistoryDifficultyFilter): FilterFn {
	if (value == null) return identity;
	return (item: FilterableItem) => item.difficulty === value;
}
function getDimensionsFilter(value: HistoryDimensionsFilter): FilterFn {
	if (value == null) return identity;
	return (item: FilterableItem) => item.dimensions === value;
}
function getFavoriteFilter(value: HistoryFavoriteFilter): FilterFn {
	if (!value) return identity;
	return (item: FilterableItem) => {
		const flagValue = item.flags?.favorite;
		return !!flagValue;
	}
}
function getRecordFilter(value: HistoryRecordFilter): FilterFn {
	if (value == null) return identity;
	// return identity;
	switch(value) {
		case null: return identity;
		case 'first': {
			return (item, { records }) => item.id != null && records.first.has(item.id);
		}
		case 'time-all': {
			return (item, { records }) => item.id != null && records.timeAll.has(item.id);
		}
		case 'time-current': {
			return (item, { records }) => item.id != null && records.timeCurrent.has(item.id);
		}
		default: {
			const x: never = value;
			throw new Error(`Invalid record filter: ${x}`);
		}
	}
}

export function getFilterFn(data: HistoryFilterData) {
	const dimensionsFilter = getDimensionsFilter(data.dimensions);
	const difficultyFilter = getDifficultyFilter(data.difficulty);
	const favoriteFilter = getFavoriteFilter(data.favorite);
	const recordFilter = getRecordFilter(data.records);

	return (item: FilterableItem, ctx: { records: HistoryListRecordsLists }) => {
		return dimensionsFilter(item, ctx) && difficultyFilter(item, ctx) && recordFilter(item, ctx) && favoriteFilter(item, ctx);
	}
}