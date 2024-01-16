import type { DifficultyKey } from "@/lib/types.js";
import type { PuzzleHistoryListItem } from "@/views/PuzzleHistoryView.vue.js";
import { computed, reactive, readonly, toRefs } from "vue";

// TODO: improve typing
export type ListFilterKey = 'timeRecord' | 'boardSize' | 'difficulty' | 'favoritesOnly';
export type ListTimeRecordFilter = 'first' | 'current' | 'record' | null;
export type ListFiltersData = {
	timeRecord: ListTimeRecordFilter;
	boardSize: string[];
	difficulty: number[];
	favoritesOnly: boolean;
}

const defaultFilterValues = (): ListFiltersData => ({
	timeRecord: null as ListTimeRecordFilter,
	boardSize: [] as string[],
	difficulty: [] as number[],
	favoritesOnly: false as boolean
})


export type ListFilterUtils = ReturnType<typeof useListFilters>;

export const useListFilters = () => {
	const filters = reactive(defaultFilterValues());

	const filterRefs = toRefs(filters);

	const activeFilters = computed(() => {
		const defaults = defaultFilterValues();
		const result: Partial<ListFiltersData> = {};
		for (const [key, valueRef] of Object.entries(filterRefs)) {
			if (JSON.stringify(valueRef.value) === JSON.stringify(defaults[key])) continue;
			result[key] = valueRef.value;
		}
		return result;
	})

	const setFilter = <K extends ListFilterKey, V extends ListFiltersData[K]>(key: K, value: V) => {
		filters[key] = value;
	}
	const removeFilter = <K extends ListFilterKey, V extends ListFiltersData[K]>(key: K) => {
		filters[key] = defaultFilterValues()[key] as V;
	}

	const filterFns = computed(() => {
		return [
			getTimeRecordFilter(filters.timeRecord),
			getBoardSizeFilter(filters.boardSize),
			getDifficultyFilter(filters.difficulty),
			getFavoritesFilter(filters.favoritesOnly)
		];
	})

	const filterItems = <T extends PuzzleHistoryListItem>(items: T[]): T[] => {
		return items.filter((i: T) => {
			return filterFns.value.every(fn => fn(i));
		})
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
		return (item: PuzzleHistoryListItem) => item.timeRecord.record && !!item.timeRecord?.first;
	} else if (selectedFilter === 'current') {
		return (item: PuzzleHistoryListItem) => item.timeRecord.record && !!item.timeRecord?.current;
	} else if (selectedFilter === 'record') {
		return (item: PuzzleHistoryListItem) => !!item.timeRecord?.record;
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
	return (item: { difficulty: DifficultyKey }) => item.difficulty >= range[0] && item.difficulty <= range[1];
}

function getFavoritesFilter(enabled: boolean) {
	if (!enabled) return () => true;
	return (item: Pick<PuzzleHistoryListItem, 'flags'>) => item?.flags?.favorite;
}