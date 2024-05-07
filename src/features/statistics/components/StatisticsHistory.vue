<template>
<div class="content flex-1 flex flex-col gap-2 pt-4">
	
	<StatisticsHistoryListDisplayOpts
		v-model:sort-selection="sortSelection"
		v-model:page-size="pageSizeComp"
	/>

	<BasePagination
		:modelValue="currentPage - 1"
		:length="numItemsFiltered"
		:page-size="currentPageSize"
		@update:model-value="(val) => currentPage = val + 1"
	/>

	<StatisticsHistoryList
		:list-key="JSON.stringify({ page, pageSize, sortBy, sortDir, filters })"
		:shown-items="shownItems"
		:num-total="historyItems?.length ?? 0"
	/>

	<BasePagination
		:modelValue="currentPage - 1"
		:length="numItemsFiltered"
		:page-size="currentPageSize"
		@update:model-value="(val) => currentPage = val + 1"
	/>

</div>
</template>

<script setup lang="ts">
import { useOffsetPagination } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useStatisticsNextStore } from '../store.js';
import { parseSortSelection, toSortSelection, getSortFn, type HistorySortBy, type HistorySortDir, type HistorySortSelection } from '../helpers/history-sort.js';
import type { StatsDbExtendedStatisticDataEntry } from '@/services/db/stats-db/models.js';

const page = defineModel<number>('page', { required: true });
const pageSize = defineModel<number>('pageSize', { required: true });
const sortBy = defineModel<HistorySortBy>('sortBy', { required: true });
const sortDir = defineModel<HistorySortDir>('sortDir', { required: true });
const filters = defineModel<unknown[]>('filters', { required: true });

const sortSelection = computed<HistorySortSelection>({
	get: () => {
		return toSortSelection(sortBy.value, sortDir.value);
	},
	set: (val: string) => {
		const [sort, dir] = parseSortSelection(val);
		sortBy.value = sort;
		sortDir.value = dir;
		page.value = 1;
	}
})
const pageSizeComp = computed<number>({
	get: () => pageSize.value,
	set: (val) => {
		pageSize.value = val;
		page.value = 1;
	}
})
// TODO: on filter change, set page to 1

const statsNextStore = useStatisticsNextStore();
const { historyItems } = storeToRefs(statsNextStore);

const filteredItems = computed((): StatsDbExtendedStatisticDataEntry[] => {
	if (!historyItems.value) return [];
	// TODO: apply filters
	return [...historyItems.value];
})
const numItemsFiltered = computed(() => filteredItems.value.length);

// Pagination
const {
	currentPage,
	currentPageSize,
	/* pageCount,
	isFirstPage,
	isLastPage,
	prev: prevPage,
	next: nextPage, */
} = useOffsetPagination({
	total: numItemsFiltered,
	// TODO: page and pageSize depend on route query on mount
	page,
	pageSize,
});

const sortFn = computed(() => getSortFn(sortSelection.value))
const sortedItems = computed(() => {
	const items = filteredItems.value;
	if (!items.length) return [];
	return [...items].sort(sortFn.value);
});
const shownItems = computed(() => {
	const start = currentPage.value * currentPageSize.value;
	const end = start + currentPageSize.value;
	return sortedItems.value.slice(start, end);
});
</script>

<style scoped>

</style>