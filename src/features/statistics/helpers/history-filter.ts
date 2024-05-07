import type { DifficultyKey, DimensionStr } from "@/lib/types.js";

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