import { createSharedComposable } from "@vueuse/core";
import { computed, reactive, readonly, toRefs } from "vue";
import type { HistoryFilterData } from "../helpers/history-filter.js";
import { parseSortSelection, toSortSelection, type HistorySortBy, type HistorySortDir } from "../helpers/history-sort.js";

export type HistoryFilterSortPaginateData = {
	page: number;
	pageSize: number;
	sortBy: HistorySortBy;
	sortDir: HistorySortDir;
} & HistoryFilterData;

const getFilterDefaults = () => ({
	difficulty: null,
	dimensions: null,
	favorite: null,
	hasNote: null,
	records: null,
});

const getDefaults = (): HistoryFilterSortPaginateData => ({
	page: 1,
	pageSize: 10,
	sortBy: 'date',
	sortDir: 'desc',
	
	...getFilterDefaults(),
});

export const useHistoryFilterSortPaginate = createSharedComposable(() => {
	const data = reactive<HistoryFilterSortPaginateData>(getDefaults());
	const sortSelection = computed({
		get: () => toSortSelection(data.sortBy, data.sortDir),
		set: (val: string) => {
			const [sort, dir] = parseSortSelection(val);
			data.sortBy = sort;
			data.sortDir = dir;
			data.page = 1;
		},
	});
	const pageSize = computed({
		get: () => data.pageSize,
		set: (val: number) => {
			// TODO: validate that pageSize is possible, considering the amount of items in the list
			data.pageSize = val;
			data.page = 1;
		}
	})
	const difficulty = computed({
		get: () => data.difficulty,
		set: (val: HistoryFilterData['difficulty']) => {
			data.difficulty = val;
			data.page = 1;
		}
	})
	const dimensions = computed({
		get: () => data.dimensions,
		set: (val: HistoryFilterData['dimensions']) => {
			data.dimensions = val;
			data.page = 1;
		}
	})
	const favorite = computed({
		get: () => data.favorite,
		set: (val: HistoryFilterData['favorite']) => {
			data.favorite = val;
			data.page = 1;
		}
	})
	const hasNote = computed({
		get: () => data.hasNote,
		set: (val: HistoryFilterData['hasNote']) => {
			data.hasNote = val;
			data.page = 1;
		}
	})
	const records = computed({
		get: () => data.records,
		set: (val: HistoryFilterData['records']) => {
			data.records = val;
			data.page = 1;
		}
	})

	const filterData = computed(() => {
		const {
			difficulty, dimensions, favorite, records, hasNote,
		} = data;
		return { difficulty, dimensions, favorite, records, hasNote };
	})
	const numActiveFilters = computed(() => {
		const filters = filterData.value;
		return Object.values(filters).reduce((acc, val) => {
			if (val == null) return acc;
			return acc + 1;
		}, 0);
	});
	const clearAllFilters = () => {
		Object.assign(data, getFilterDefaults());
	}

	const {
		page,
		sortBy, sortDir,
	} = toRefs(data);

	// Used for slicing the list of items
	const pageItemStart = computed(() => (page.value - 1) * pageSize.value);
	const pageItemEnd = computed(() => pageItemStart.value + pageSize.value);

	return {
		// reactive refs/data/writable computeds
		page,
		pageItemStart, pageItemEnd,
		pageSize,
		sortSelection,
		difficulty, dimensions, favorite, records, hasNote,
		// readonly refs
		sortBy: readonly(sortBy), sortDir: readonly(sortDir),
		filterData,
		numActiveFilters,

		getDefaults,
		clearAllFilters,
	};
})