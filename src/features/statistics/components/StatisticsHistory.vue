<template>
<div class="content flex-1 flex flex-col gap-2">
	
	<StatisticsHistoryListDisplayOpts />

	<div ref="topAnchorEl" class="h-0 w-0"></div>
	<BasePagination
		:model-value="page - 1"
		:length="numItemsFiltered"
		:page-size="pageSize"
		@update:model-value="page = $event + 1"
	/>

	<StatisticsHistoryList
		:list-key="JSON.stringify({ page, pageSize, sortSelection, filterData })"
		:shown-items="shownItems"
		:num-total="itemsRecentFirst?.length ?? 0"
		:record-data="recordData"
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
import { computed, ref, watch } from 'vue';
import { useStatisticsNextStore } from '../store.js';
import { getSortFn } from '../helpers/history-sort.js';
import type { StatsDbExtendedStatisticDataEntry } from '@/services/db/stats-db/models.js';
import { useHistoryFilterSortPaginate } from '../composables/history-filter-sort-paginate.js';
import { getFilterFn } from '../helpers/history-filter.js';
import { useHistoryListRecords } from '../composables/history-list-records.js';

const { 
	page,
	pageSize,
	pageItemStart, pageItemEnd,
	sortSelection,
	filterData,
} = useHistoryFilterSortPaginate();

const statsNextStore = useStatisticsNextStore();
const { itemsRecentFirst } = storeToRefs(statsNextStore);

const itemsOldestFirst = computed(() => itemsRecentFirst.value.toReversed());
const recordData = useHistoryListRecords(itemsOldestFirst);

const sortFn = computed(() => getSortFn(sortSelection.value));
const filterFn = computed(() => getFilterFn(filterData.value));

const filteredItems = computed((): StatsDbExtendedStatisticDataEntry[] => {
	if (!itemsRecentFirst.value) return [];
	const ctx = { records: recordData.value }
	return [...itemsRecentFirst.value].filter(val => filterFn.value(val, ctx));
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


function scrollToList(el: HTMLElement) {
	// Check if above or below viewport. If below, do nothing, is the user is already required to scroll (possibly due to filters being visible)
	// If above, scroll to anchor. This is so that, when the page changes using the bottom pagination element, the new items are immediately visible.
	const rect = el.getBoundingClientRect();
	if (rect.top > 0) return;
	el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
const topAnchorEl = ref<null | HTMLElement>(null);
watch(page, (cur, prev) => {
	if (cur === prev) return;
	if (topAnchorEl.value) {
		scrollToList(topAnchorEl.value);
	}
})
</script>