<template>
<div class="flex flex-col overflow-y-auto">
	<PageHeader
		:back-options="{ type: 'force', prevRouteName: 'StatisticsNext' }"
	>{{ $t('Statistics.History.puzzle-history') }}</PageHeader>

	<StatisticsStoreLoader>
		<div class="content flex-1 flex flex-col gap-2 pt-4">
			<BasePagination
				:modelValue="currentPage - 1"
				:length="numItemsTotal"
				:page-size="currentPageSize"
				@update:model-value="(val) => currentPage = val + 1"
			/>
			<div>
				<label class="text-sm flex flex-row items-center px-2 pb-4"><span>Sort by:</span>
					<select
						:value="sortSelection"
						class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-sm"
						@change="changeSort(($event.target as HTMLSelectElement).value as SortSelection)"
					>
						<option value="newest">Newest first</option>
						<option value="oldest">Oldest first</option>
						<option value="fastestTime">Fastest time solved</option>
						<option value="slowestTime">Slowest time solved</option>
					</select>
				</label>
			</div>
			<transition name="fade" mode="out-in">
				<div
					v-if="shownItems.length"
					:key="JSON.stringify({
						currentPage, sortOptions
					})"
					class="list divide-y border-y relative"
				>
					<HistoryListItem
						v-for="item in shownItems"
						:key="item.id"
						:item="item"
						:time-record="null"
					/>
				</div>
				<div
					v-else-if="historyItems && historyItems.length"
					key="none-filtered"
					class="py-4 text-lg px-8 text-center"
				>
					{{ $t('Statistics.History.none-found-with-filters') }}
				</div>
				<div
					v-else
					key="none"
					class="py-4 text-lg px-8 text-center"
				>
					{{ $t('Statistics.History.none-played-yet') }}
				</div>
			</transition>
		</div>
		<BasePagination
			:modelValue="currentPage - 1"
			:length="numItemsTotal"
			:page-size="currentPageSize"
			@update:model-value="(val) => currentPage = val + 1"
		/>
	</StatisticsStoreLoader>
</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useStatisticsNextStore } from '@/features/statistics/store.js';
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useOffsetPagination } from '@vueuse/core';
import { watch } from 'vue';
import { onBeforeMount } from 'vue';

const statsNextStore = useStatisticsNextStore();
statsNextStore.initialize({ forceUpdate: false });
const route = useRoute();

const { historyItems } = storeToRefs(statsNextStore);
const numItemsTotal = computed(() => historyItems.value?.length ?? 0);

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
	total: numItemsTotal,
	// TODO: page and pageSize depend on route query on mount
	page: 1,
	pageSize: 30,
})

// Sorting
type SortKey = 'date' | 'time';
type SortDir = 'asc' | 'desc';
type SortSelection = 'newest' | 'oldest' | 'fastestTime' | 'slowestTime';
const sortSelection = ref('newest' as SortSelection);
const sortKey = computed((): SortKey => {
	switch (sortSelection.value) {
		case 'newest':
		case 'oldest':
			return 'date';
		case 'fastestTime':
		case 'slowestTime':
			return 'time';
		default: {
			const _exhaustiveCheck: never = sortSelection.value;
			return _exhaustiveCheck;
		}
	}
})
const sortDir = computed((): SortDir => {
	switch (sortSelection.value) {
		case 'newest':
		case 'slowestTime':
			return 'desc';
		case 'oldest':
		case 'fastestTime':
			return 'asc';
		default: {
			const _exhaustiveCheck: never = sortSelection.value;
			return _exhaustiveCheck;
		}
	}
})
const sortOptions = computed(() => ({
	key: sortKey.value,
	dir: sortDir.value,
}))
const changeSort = (value: SortSelection) => {
	sortSelection.value = value;
	// Reset page to 1
	currentPage.value = 1;
}

// Filtering: when filters change, update "shownItems" ref
const currentFilters = ref({
	favorites: undefined as true | undefined,
	difficulty: undefined as number | undefined,
	size: undefined as string | undefined,
});

const filterByFavoritesOnly = computed({
	get: () => !!currentFilters.value.favorites,
	set: (val: boolean) => {
		currentFilters.value.favorites = val ? true : undefined;
	}
})

watch(currentFilters, () => {
	// Reset page to 1
	currentPage.value = 1;
})

const sortedAndFilteredItems = computed(() => {
	const items = historyItems.value;
	if (!items) return [];
	const filtered = items.filter(item => {
		if (currentFilters.value.favorites && !item.flags.favorite) return false;
		if (currentFilters.value.difficulty && item.difficulty !== currentFilters.value.difficulty) return false;
		if (currentFilters.value.size && item.dimensions !== currentFilters.value.size) return false;
		return true;
	})
	const sorted = filtered.sort((a, b) => {
		const key = sortOptions.value.key === 'date' ? 'timestamp' : 'timeElapsed';
		const dir = sortOptions.value.dir;
		if (a[key] < b[key]) return dir === 'asc' ? -1 : 1;
		if (a[key] > b[key]) return dir === 'asc' ? 1 : -1;
		return 0;
	})
	return sorted;
})
const shownItems = computed(() => {
	const start = (currentPage.value - 1) * currentPageSize.value;
	const end = start + currentPageSize.value;
	return sortedAndFilteredItems.value.slice(start, end);
})

onBeforeMount(() => {
	const q = route.query;
	console.log({ q: { ...q}});
	// Set initial sort and filters based on route query
	if (q.sort) {
		sortSelection.value = q.sort as SortSelection;
	}
	if (q.favorites === 'true') {
		filterByFavoritesOnly.value = q.favorites === 'true';
	}
	if (q.difficulty) {
		currentFilters.value.difficulty = parseInt(q.difficulty as string);
	}
	if (q.size) {
		currentFilters.value.size = q.size as string;
	}
	if (q.page) {
		currentPage.value = parseInt(q.page as string);
	}
	if (q.perPage) {
		currentPageSize.value = parseInt(q.perPage as string);
	}
})
</script>