import type { DifficultyKey, DimensionStr } from "@/lib/types.js";

export type HistoryDifficultyFilter = DifficultyKey | null;
export type HistoryDimensionsFilter = DimensionStr | /* DimensionStr[] |  */null;
export type HistoryFavoriteFilter = true | null;
export type HistoryRecordFilter = /* TODO 'time-current' | 'time-all' | 'first' |  */null;

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
	}
}
type FilterFn = (item: FilterableItem) => boolean;
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

export function getFilterFn(data: HistoryFilterData) {
	const difficultyFilter = getDifficultyFilter(data.difficulty);
	const dimensionsFilter = getDimensionsFilter(data.dimensions);
	const favoriteFilter = getFavoriteFilter(data.favorite);

	return (item: FilterableItem) => {
		return difficultyFilter(item) && dimensionsFilter(item) && favoriteFilter(item);
	}
}