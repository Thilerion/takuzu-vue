<template>
	<div class="flex flex-col overflow-y-auto">
		<PageHeader>Puzzle history</PageHeader>
		<div class="content flex-1 flex flex-col gap-2 pt-4">
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
						@save-note="(note) => saveNote(item.id, note)"
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

function resetCurrentItems(items, { sortBy }, filterItemsFn) {
	const sortFn = sortFns[sortBy];

	if (filterItemsFn) {
		return filterItemsFn(items).sort(sortFn);
	} else {
		throw new Error('No filter items function defined?');
	}
}

const getDefaultOptions = () => ({
	sortBy: 'newest',
	page: 0,
	pageSize: 30
});
</script>

<script setup>
import { useStatisticsStore } from '@/stores/statistics.js';
import { storeToRefs } from 'pinia';
import { ref, computed, watch, onBeforeMount, reactive, toRefs, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useListFilters } from '@/components/statistics/history-list/useListFilters';
import { useDebounceFn } from '@vueuse/core';

const showFilters = ref(false);
const toggleShowFilters = () => showFilters.value = !showFilters.value;

const statsStore = useStatisticsStore();

const { historyItems: rawHistoryItems, historyItemsWithTimeRecord } = storeToRefs(statsStore);

const getTimeRecordType = (id) => {
	const { all, current, first } = historyItemsWithTimeRecord.value;
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
	if (!historyItemsWithTimeRecord.value) return null;
	const value = historyItemsWithTimeRecord.value.all.includes(id);
	if (!value) return null;
	const current = value && historyItemsWithTimeRecord.value.current.includes(id);
	const first = value && historyItemsWithTimeRecord.value.first.includes(id);
	return { value, current, first };
}

const dataOptions = reactive(getDefaultOptions())

const { page, pageSize } = toRefs(dataOptions);

const currentItems = ref(null);

const { currentFilters, activeFilters, filterFns, filterItems, setFilter, removeFilter } = useListFilters();
provide('filterUtils', { currentFilters, activeFilters, filterFns, filterItems, setFilter, removeFilter });

const parseFilterQueryData = (data = {}) => {
	for (const [key, strVal] of Object.entries(data)) {
		console.log({key, strVal});
		try {
			const val = JSON.parse(strVal);
			setFilter(key, val);

		} catch(e) {
			console.warn(e);
		}
	}
	return;
}



onBeforeMount(() => {
	statsStore.initialize({ forceUpdate: false });

	const route = useRoute();
	const { query } = route;

	const {
		page: queryPage = dataOptions.page,
		pageSize: queryPageSize = dataOptions.pageSize,
		sortBy: querySortBy = dataOptions.sortBy,
		...activeFilterQueryData
	} = query;


	dataOptions.sortBy = querySortBy;
	dataOptions.page = queryPage * 1;
	dataOptions.pageSize = queryPageSize * 1;

	parseFilterQueryData(activeFilterQueryData);
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
watch([dataOptions, activeFilters], ([value]) => {
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
const saveNote = async (id, note) => {
	statsStore.saveNote(id, note);
}
const deleteItem = async (id) => {
	await statsStore.deleteItem(id);
	currentItems.value = resetCurrentItems(historyItems.value, dataOptions, filterItems);
}

function getFilterQueryFromOptions() {
	const result = {};
	for (const [key, val] of Object.entries(activeFilters.value)) {
		result[key] = JSON.stringify(val);
	}
	return result;
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