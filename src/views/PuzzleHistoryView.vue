<template>
	<div class="flex flex-col overflow-y-auto">
		<PageHeader>Puzzle history</PageHeader>
		<div class="content flex-1 flex flex-col gap-2">
			<div class="select-inputs text-sm" ref="anchorEl">
				<div class="flex justify-between items-center pb-4 px-2">

					<label
						class="text-sm flex flex-row items-center gap-3"
						><span>Per page:</span>
						<select
							:value="pageSize" @change="(ev) => setPageSize(ev.target.value * 1)"
							class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-sm">
							<option :value="15">15</option>
							<option :value="30">30</option>
							<option :value="50">50</option>
							<option :value="100">100</option>
						</select>
					</label>

					<BaseButton @click="toggleShowFilters" :class="{ 'btn-primary': showFilters }"><span
							v-if="showFilters">Hide filters</span><span v-else>Show filters</span></BaseButton>
				</div>
				<label class="text-sm flex flex-row items-center px-2 pb-4"><span>Sort by:</span>
						<select :value="dataOptions.sortBy" @change="ev => changeSort(ev.target.value)"
							class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-sm">
							<option value="newest">Newest first</option>
							<option value="oldest">Oldest first</option>
							<option value="fastestTime">Fastest time solved</option>
							<option value="slowestTime">Slowest time solved</option>
						</select>
					</label>
				<HistoryListFilters v-model="showFilters" />
			</div>
			<BasePagination :modelValue="page" @update:modelValue="setActivePage" :length="currentItems.length"
				:page-size="pageSize" />
			<transition name="fade" mode="out-in">
				<div class="list divide-y border-y relative" v-if="shownItems.length"
					:key="JSON.stringify({ dataOptions })">
					<HistoryListItem v-for="item in shownItems" :key="item.id" v-bind="item"
						:time-record="isTimeRecord(item)" @favorite="(val) => markFavorite(item.id, val)"
						@delete="() => deleteItem(item.id)"></HistoryListItem>
				</div>
				<div class="py-4 text-lg px-8 text-center" v-else-if="historyItems.length" key="none-filtered">No
					puzzles found with current filters!</div>
				<div class="py-4 text-lg px-8 text-center" key="none" v-else>You haven't played any puzzles yet!</div>
			</transition>
		</div>
		<BasePagination :modelValue="page" @update:modelValue="setActivePage" :length="currentItems.length"
			:page-size="pageSize" />
	</div>
</template>

<script>

const sortDateNewest = (a, b) => {
	if (a.date < b.date) return 1;
	else if (a.date > b.date) return -1;
	return 0;
}
const sortDateOldest = (a, b) => {
	return sortDateNewest(b, a);
}
const sortTimeElapsedFastest = (a, b) => {
	return a.timeElapsed - b.timeElapsed;
}
const sortTimeElapsedSlowest = (a, b) => sortTimeElapsedFastest(b, a);

const sortFns = {
	newest: sortDateNewest,
	oldest: sortDateOldest,
	fastestTime: sortTimeElapsedFastest,
	slowestTime: sortTimeElapsedSlowest
}

function sortItems(items, sortBy = 'newest') {
	const fn = sortFns[sortBy];
	items.sort(fn);
	return items;
}

const boardSizeFilterValues = [
	['All'],
	[6, 6], [8, 8], [10, 10], [12, 12], [14, 14],
	[6, 10], [8, 12], [10, 14], [12, 16],
	[7, 7], [9, 9], [11, 11], [13, 13],
].map(arr => arr.join('x'));
const difficultyFilterValues = [
	'All', 1, 2, 3, 4, 5
];

const boardSizeFilterFns = boardSizeFilterValues.reduce((acc, val) => {
	const fn = val === 'All' ? () => true : (item) => item.dimensions === val;
	acc[val] = fn;
	return acc;
}, {});

const difficultyFilterFns = difficultyFilterValues.reduce((acc, val) => {
	const fn = val === 'All' ? () => true : (item) => item.difficulty === val;
	acc[val] = fn;
	return acc;
}, {})

function resetCurrentItems(items, { sortBy, filters }, filterItemsFn) {
	const sortFn = sortFns[sortBy];

	const filterFns = [];
	if (filters.timeRecord !== 'Any' && !!filters.timeRecord) {
		if (filters.timeRecord === 'Current') {
			filterFns.push((item) => !!(item?.timeRecord?.record) && item.timeRecord.current);
		} else if (filters.timeRecord === 'First') {
			filterFns.push((item) => !!(item?.timeRecord?.record) && item.timeRecord.first);
		} else if (filters.timeRecord) {
			filterFns.push((item) => !!(item?.timeRecord?.record));
		}
	}
	if (filters.favoritesOnly) {
		filterFns.push((item) => !!(item?.flags?.favorite));
	}
	if (filters.boardSize && (filters.boardSize in boardSizeFilterFns)) {
		filterFns.push(boardSizeFilterFns[filters.boardSize]);
	}
	if (filters.difficulty && (filters.difficulty in difficultyFilterFns)) {
		filterFns.push(difficultyFilterFns[filters.difficulty]);
	}

	if (filterItemsFn) {
		return filterItemsFn(items).sort(sortFn);
	}

	return items.filter(item => {
		return filterFns.every(filterFn => filterFn(item));
	}).sort(sortFn);
}

const getDefaultOptions = () => ({
	sortBy: 'newest',
	filters: {
		boardSize: 'All',
		difficulty: 'All',
		favoritesOnly: false,
		timeRecord: 'Any'
	},
	page: 0,
	pageSize: 30
});

function getFilterQueryFromOptions({
	boardSize, difficulty, favoritesOnly
}) {
	const defaults = getDefaultOptions().filters;
	return {
		boardSize: boardSize === defaults.boardSize ? undefined : boardSize,
		difficulty: difficulty === defaults.difficulty ? undefined : difficulty,
		favorites: favoritesOnly === defaults.favoritesOnly ? undefined : favoritesOnly
	}
}

function getQueryFromFilterAndSortOptions({
	sortBy, filters, pageSize, page
}) {
	const defaults = getDefaultOptions();

	const query = {
		page: page === defaults.page ? undefined : page,
		sortBy: sortBy === defaults.sortBy ? undefined : sortBy,
		pageSize: pageSize === defaults.pageSize ? undefined : pageSize,
		...getFilterQueryFromOptions(filters)
	}
	return query;
}

</script>

<script setup>
import PageHeader from '@/components/global/base-layout/PageHeader.vue';
import { useStatisticsStore } from '@/stores/statistics.js';
import { storeToRefs } from 'pinia';
import { ref, computed, watchEffect, watch, onBeforeMount, reactive, toRefs, onMounted, provide } from 'vue';
import HistoryListItem from '@/components/statistics/history-list/HistoryListItem.vue';
import BasePagination from '@/components/global/BasePagination.vue';
import { useRoute, useRouter } from 'vue-router';
import ExpandTransition from '@/views/transitions/ExpandTransition.vue';
import { useListFilters } from '@/components/statistics/history-list/useListFilters';
import { useDebounceFn, useThrottleFn } from '@vueuse/core';

const showFilters = ref(false);
const toggleShowFilters = () => showFilters.value = !showFilters.value;

const statsStore = useStatisticsStore();

const { historyItems: rawHistoryItems, historyItemsWithTimeRecord2 } = storeToRefs(statsStore);

const getTimeRecordType = (id) => {
	const { all, current, first } = historyItemsWithTimeRecord2.value;
	if (!all.includes(id)) return { record: false };
	const isCurrent = current.includes(id);
	const isFirst = first.includes(id);
	return { record: true, current: isCurrent, first: isFirst };
}

const historyItems = computed(() => {
	console.log('getHistoryItems');
	const res = rawHistoryItems.value.map(item => {
		const { id } = item;
		const timeRecord = getTimeRecordType(id);
		return { ...item, timeRecord };
	})
	return res;
})


const isTimeRecord = (item) => {
	const id = item.id;
	if (!historyItemsWithTimeRecord2.value) return null;
	const value = historyItemsWithTimeRecord2.value.all.includes(id);
	if (!value) return null;
	const current = value && historyItemsWithTimeRecord2.value.current.includes(id);
	const first = value && historyItemsWithTimeRecord2.value.first.includes(id);
	return { value, current, first };
}

const dataOptions = reactive(getDefaultOptions())

const { page, pageSize } = toRefs(dataOptions);

const currentItems = ref(null);

const { currentFilters, activeFilters, filterFns, filterItems, setFilter, removeFilter } = useListFilters();
provide('filterUtils', { currentFilters, activeFilters, filterFns, filterItems, setFilter, removeFilter });



onBeforeMount(() => {
	statsStore.initialize({ forceUpdate: false });

	const route = useRoute();
	const { query } = route;

	const {
		page: queryPage = dataOptions.page,
		pageSize: queryPageSize = dataOptions.pageSize,
		sortBy: querySortBy = dataOptions.sortBy,
		...maybeQueryFilters
	} = query;

	dataOptions.sortBy = querySortBy;
	dataOptions.page = queryPage * 1;
	dataOptions.pageSize = queryPageSize * 1;

	// TODO: set filters from query
	dataOptions.filters.favoritesOnly = maybeQueryFilters.favorites ?? dataOptions.filters.favoritesOnly;
	dataOptions.filters.boardSize = maybeQueryFilters.boardSize ?? dataOptions.filters.boardSize;
	dataOptions.filters.difficulty = maybeQueryFilters.difficulty ?? dataOptions.filters.difficulty;

	currentItems.value = resetCurrentItems(historyItems.value, dataOptions, filterItems);
})

watch(historyItems, (items) => {
	currentItems.value = resetCurrentItems(items, dataOptions, filterItems);
})

const setActivePage = (value) => {
	dataOptions.page = value;
}
const setPageSize = (value) => {
	if (value === dataOptions.pageSize) return;
	setActivePage(0);
	dataOptions.pageSize = value;
}

const changeSort = (sortType) => {
	if (sortType === dataOptions.sortBy) return;
	setActivePage(0);
	dataOptions.sortBy = sortType;
	currentItems.value = sortItems(currentItems.value, sortType);
}

const setBoardSizeFilter = (value) => {
	const current = dataOptions.filters.boardSize;
	if (value === current) return;

	setActivePage(0);
	dataOptions.filters.boardSize = value;
	if (!value || value === 'All') {
		setFilter('boardSize', []);
	} else {
		setFilter('boardSize', [value]);

	}
	currentItems.value = resetCurrentItems(historyItems.value, dataOptions, filterItems);
}
const setDifficultyFilter = (value) => {
	const current = dataOptions.filters.difficulty;
	if (value === current) return;

	setActivePage(0);
	dataOptions.filters.difficulty = value;
	if (!value || value === 'All') {
		setFilter('difficulty', [1, 5]);
	} else {
		setFilter('difficulty', [value, value]);
	}
	currentItems.value = resetCurrentItems(historyItems.value, dataOptions, filterItems);
}
const setTimeRecordFilter = (value) => {
	const current = dataOptions.filters.timeRecord;
	if (value === current) return;
	setActivePage(0);
	dataOptions.filters.timeRecord = value;
	if (value === 'Any') {
		setFilter('timeRecord', null);
	} else if (value === 'Only') {
		setFilter('timeRecord', 'record');
	} else {
		setFilter('timeRecord', value.toLowerCase());
	}
	currentItems.value = resetCurrentItems(historyItems.value, dataOptions, filterItems);
}

watch(() => dataOptions.filters.favoritesOnly, (val, prev) => {
	if (val === prev) return;
	setActivePage(0);
	setFilter('favoritesOnly', val);
	currentItems.value = resetCurrentItems(historyItems.value, dataOptions, filterItems);
})

const updateFilteredItems = () => {
	setActivePage(0);
	currentItems.value = resetCurrentItems(historyItems.value, dataOptions, filterItems);
}

watch(activeFilters, useDebounceFn(updateFilteredItems, 800, { maxWait: 5000 }));

// TODO: set router query on dataOptions change

const anchorEl = ref(null);
watch(() => dataOptions.page, (value, prev) => {
	if (value === prev) return;
	if (anchorEl.value != null) {
		anchorEl.value.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest'
		})
	}
})
const route = useRoute();
const router = useRouter();
watch(dataOptions, (value) => {
	const query = getQueryFromFilterAndSortOptions(value);
	const routePath = route.path;
	router.replace({ path: routePath, query });
}, { deep: true });

const shownItems = computed(() => {
	const idx = dataOptions.page * dataOptions.pageSize;
	return currentItems.value.slice(idx, idx + dataOptions.pageSize);
})

const markFavorite = async (id, value) => {
	statsStore.markFavorite(id, value);
}
const deleteItem = async (id) => {
	await statsStore.deleteItem(id);
	currentItems.value = resetCurrentItems(historyItems.value, dataOptions, filterItems);
}
</script>

<style scoped>
.fade-enter-active {
	transition: opacity .15s ease;
}

.fade-leave-active {
	transition: opacity .05s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.sort-btn {
	@apply text-sm px-3 py-2 bg-white border rounded;
}

.sort-btn.selected {
	@apply font-bold;
}

.select-inputs label>span:first-child {
	@apply w-20;
}
</style>