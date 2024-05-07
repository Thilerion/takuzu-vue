<template>
<div class="content flex-1 flex flex-col gap-2 pt-4">
	
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

const { 
	page,
	pageSize,
	pageItemStart, pageItemEnd,
	sortSelection,
} = useHistoryFilterSortPaginate();

const statsNextStore = useStatisticsNextStore();
const { historyItems } = storeToRefs(statsNextStore);

const filteredItems = computed((): StatsDbExtendedStatisticDataEntry[] => {
	if (!historyItems.value) return [];
	// TODO: apply filters
	return [...historyItems.value];
})
const numItemsFiltered = computed(() => filteredItems.value.length);

// Pagination
const sortFn = computed(() => getSortFn(sortSelection.value))
const sortedItems = computed(() => {
	const items = filteredItems.value;
	if (!items.length) return [];
	return [...items].sort(sortFn.value);
});
const shownItems = computed(() => {
	return sortedItems.value.slice(pageItemStart.value, pageItemEnd.value);
});
</script>