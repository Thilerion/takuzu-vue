import type { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";

export type DateSortable = {
	date: Date;
}
export type TimeElapsedSortable = {
	timeElapsed: number;
}
export type SortableHistoryItem = DateSortable & TimeElapsedSortable;

const sortDateNewest = (a: DateSortable, b: DateSortable) => {
	if (a.date < b.date) return 1;
	else if (a.date > b.date) return -1;
	return 0;
}
const sortDateOldest = (a: DateSortable, b: DateSortable) => {
	return sortDateNewest(b, a);
}
const sortTimeElapsedFastest = (a: TimeElapsedSortable, b: TimeElapsedSortable) => {
	return a.timeElapsed - b.timeElapsed;
}
const sortTimeElapsedSlowest = (a: TimeElapsedSortable, b: TimeElapsedSortable) => sortTimeElapsedFastest(b, a);

const sortFns = {
	newest: sortDateNewest,
	oldest: sortDateOldest,
	fastestTime: sortTimeElapsedFastest,
	slowestTime: sortTimeElapsedSlowest
} as const;
export type SortType = keyof typeof sortFns;
const SORT_TYPES = Object.keys(sortFns) as SortType[];
const isSortType = (str: string): str is SortType => SORT_TYPES.includes(str as any);

export type SortOptions = {
	sortBy: SortType;
	page: number;
	pageSize: number;
}

function sortItems<T extends SortableHistoryItem>(items: T[], sortBy: SortType = 'newest'): T[] {
	const fn = sortFns[sortBy];
	items.sort(fn);
	return items;
}

function resetCurrentItems<T extends StatsDbExtendedStatisticDataEntry>(items: T[], { sortBy }: Pick<SortOptions, 'sortBy'>, filterItemsFn: (items: T[]) => T[]): T[] {
	const sortFn = sortFns[sortBy];

	if (filterItemsFn) {
		return filterItemsFn(items).sort(sortFn);
	} else {
		throw new Error('No filter items function defined?');
	}
}

const getDefaultOptions = (): SortOptions => ({
	sortBy: 'newest',
	page: 0,
	pageSize: 30
});

export const usePuzzleHistorySorting = () => {
	return {
		getDefaultOptions,

		sortItems,
		resetCurrentItems,
		isSortType,
		sortFns
	}
}