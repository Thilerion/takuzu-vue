<template>
<div class="content flex-1 flex flex-col gap-2">
	
	<StatisticsHistoryListDisplayOpts />

	<BasePagination
		:model-value="page - 1"
		:length="numItemsFiltered"
		:page-size="pageSize"
		@update:model-value="page = $event + 1"
	/>

	<StatisticsHistoryList
		:list-key="JSON.stringify({ page, pageSize, sortSelection })"
		:shown-items="shownItems"
		:num-total="historyItems?.length ?? 0"
	/>

	<BasePagination
		:model-value="page - 1"
		:length="numItemsFiltered"
		:page-size="pageSize"
		@update:model-value="page = $event + 1"
	/>

</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useStatisticsNextStore } from '../store.js';
import { getSortFn } from '../helpers/history-sort.js';
import type { StatsDbExtendedStatisticDataEntry } from '@/services/db/stats-db/models.js';
import { useHistoryFilterSortPaginate } from '../composables/history-filter-sort-paginate.js';
import { getFilterFn } from '../helpers/history-filter.js';

const { 
	page,
	pageSize,
	pageItemStart, pageItemEnd,
	sortSelection,
	filterData,
} = useHistoryFilterSortPaginate();

const statsNextStore = useStatisticsNextStore();
const { historyItems } = storeToRefs(statsNextStore);

const sortFn = computed(() => getSortFn(sortSelection.value));
const filterFn = computed(() => getFilterFn(filterData.value));

const filteredItems = computed((): StatsDbExtendedStatisticDataEntry[] => {
	if (!historyItems.value) return [];
	return [...historyItems.value].filter(val => filterFn.value(val));
})
const numItemsFiltered = computed(() => filteredItems.value.length);


const sortedItems = computed(() => {
	const items = filteredItems.value;
	if (!items.length) return [];
	return [...items].sort(sortFn.value);
});
const shownItems = computed(() => {
	return sortedItems.value.slice(pageItemStart.value, pageItemEnd.value);
});
</script>