import type { DifficultyKey } from "@/lib/types.js";
import type { PuzzleHistoryListItem } from "@/views/PuzzleHistoryView.vue";
import { computed, reactive, readonly, toRefs } from "vue";

export type ListFilterKey = 'timeRecord' | 'boardSize' | 'difficulty' | 'favoritesOnly';
export type ListTimeRecordFilter = 'first' | 'current' | 'record' | null;
export type ListFiltersData = {
	timeRecord: ListTimeRecordFilter;
	boardSize: string[];
	difficulty: DifficultyKey[];
	favoritesOnly: boolean;
}
export type FilterableListItem = PuzzleHistoryListItem /* {
	timeRecord: {
		record: true,
		first: boolean,
		current: boolean
	} | { record: false },
	dimensions: string,
	difficulty: DifficultyKey,
	flags?: {
		favorite?: boolean
	}
} */

const defaultFilterValues = (): ListFiltersData => ({
	timeRecord: null,
	boardSize: [],
	difficulty: [],
	favoritesOnly: false
})

export type ListFilterUtils = ReturnType<typeof useListFilters>;

function isKeyOfListFiltersData(key: string): key is ListFilterKey {
	return ['timeRecord', 'boardSize', 'difficulty', 'favoritesOnly'].includes(key);
}

export const useListFilters = () => {
	const filters = reactive(defaultFilterValues());
	const filterRefs = toRefs(filters);

	const activeFilters = computed(() => {
		const defaults = defaultFilterValues();
		const result: Partial<ListFiltersData> = {};

		for (const [key, valueRef] of Object.entries(filterRefs)) {
			if (isKeyOfListFiltersData(key)) {
				if (JSON.stringify(valueRef.value) !== JSON.stringify(defaults[key])) {
					(result as any)[key] = valueRef.value;
				}
			}
		}

		return result as Partial<ListFiltersData>;
	})

	const setFilter = <K extends ListFilterKey, V extends ListFiltersData[K]>(key: K, value: V) => {
		filters[key] = value;
	}

	const removeFilter = <K extends ListFilterKey>(key: K) => {
		filters[key] = defaultFilterValues()[key] as ListFiltersData[K];
	}

	const filterFns = computed(() => {
		return [
			getTimeRecordFilter(filters.timeRecord),
			getBoardSizeFilter(filters.boardSize),
			getDifficultyFilter(filters.difficulty),
			getFavoritesFilter(filters.favoritesOnly)
		];
	})

	const filterItems = <T extends FilterableListItem>(items: T[]): T[] => {
		return items.filter((item: T) => filterFns.value.every(fn => fn(item)));
	}

	return {
		currentFilters: readonly(filters),
		activeFilters,
		filterFns,
		filterItems,
		setFilter,
		removeFilter
	}
}

function getTimeRecordFilter(selectedFilter: ListTimeRecordFilter) {
	if (selectedFilter === 'first') {
		return (item: FilterableListItem) => item.timeRecord.record && !!item.timeRecord?.first;
	} else if (selectedFilter === 'current') {
		return (item: FilterableListItem) => item.timeRecord.record && !!item.timeRecord?.current;
	} else if (selectedFilter === 'record') {
		return (item: FilterableListItem) => !!item.timeRecord?.record;
	} else return () => true;
}

function getBoardSizeFilter(selectedSizes: string[]) {
	if (!selectedSizes?.length) return () => true;

	return (item: { dimensions: string }) => {
		return selectedSizes.includes(item.dimensions);
	}
}

function getDifficultyFilter(range: number[]) {
	if (range?.length !== 2) return () => true;
	return (item: FilterableListItem) => item.difficulty >= range[0] && item.difficulty <= range[1];
}

function getFavoritesFilter(enabled: boolean) {
	if (!enabled) return () => true;
	return (item: FilterableListItem) => item.flags?.favorite;
}