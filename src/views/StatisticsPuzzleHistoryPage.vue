<template>
<div class="flex flex-col overflow-y-auto">
	<PageHeader
		:back-options="{ type: 'force', prevRouteName: 'StatisticsNext' }"
	>{{ $t('Statistics.History.puzzle-history') }}</PageHeader>

	<StatisticsStoreLoader>
		<StatisticsHistory
			v-model:page="data.page"
			v-model:pageSize="data.pageSize"
			v-model:sortBy="data.sortBy"
			v-model:sortDir="data.sortDir"
		/>
	</StatisticsStoreLoader>
</div>
</template>

<script setup lang="ts">
import { isDifficultyKey } from '@/config.js';
import type { HistoryFilterData } from '@/features/statistics/helpers/history-filter.js';
import { isSortDir, isSortByKey, type HistorySortBy, type HistorySortDir } from '@/features/statistics/helpers/history-sort.js';
import type { DimensionStr } from '@/lib/types.js';
import { onBeforeMount, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

type HistoryParsedQueryData = {
	page: number;
	pageSize: number;
	sortBy: HistorySortBy;
	sortDir: HistorySortDir;
} & HistoryFilterData;

const getDefaults = (): HistoryParsedQueryData => ({
	page: 1,
	pageSize: 10,
	sortBy: 'date',
	sortDir: 'desc',
	
	difficulty: null,
	dimensions: null,
	favorite: null,
	records: null,
});
const data = reactive<HistoryParsedQueryData>(getDefaults());

function applyParsedQueryParams(updatedData: Partial<HistoryParsedQueryData>) {
	data.page = updatedData.page ?? data.page;
	data.pageSize = updatedData.pageSize ?? data.pageSize;
	data.sortBy = updatedData.sortBy ?? data.sortBy;
	data.sortDir = updatedData.sortDir ?? data.sortDir;
	
	if (updatedData.difficulty !== undefined) {
		data.difficulty = updatedData.difficulty;
	}
	if (updatedData.dimensions !== undefined) {
		data.dimensions = updatedData.dimensions;
	}
	if (updatedData.favorite !== undefined) {
		data.favorite = updatedData.favorite;
	}
	if (updatedData.records !== undefined) {
		data.records = updatedData.records;
	}
}

function parseQueryParams(q: Record<string, string | null | (string | null)[]>): Partial<HistoryParsedQueryData> {
	const result: Partial<HistoryParsedQueryData> = {};
	// Set initial sort and filters based on route query
	if (q.sort) {
		if (isSortByKey(q.sort)) {
			result.sortBy = q.sort;
		} else {
			// TODO: remove from query
			console.warn('Invalid sort key:', q.sort);
		}
	}
	if (q.sortDir) {
		if (isSortDir(q.sortDir)) {
			result.sortDir = q.sortDir;
		} else {
			// TODO: remove from query
			console.warn('Invalid sort direction:', q.sortDir);
		}
	}
	if (q.page) {
		const pageInt = parseInt(q.page as string);
		if (!Number.isNaN(pageInt) && pageInt > 0) {
			result.page = pageInt;
		} else {
			// TODO: remove from query
			console.warn('Invalid page:', q.page);
		}
	}
	if (q.pageSize) {
		const pageSizeInt = parseInt(q.pageSize as string);
		if (!Number.isNaN(pageSizeInt) && pageSizeInt > 0) {
			result.pageSize = pageSizeInt;
		} else {
			// TODO: remove from query
			console.warn('Invalid pageSize:', q.pageSize);
		}
	}

	if (q.difficulty) {
		const diffInt = parseInt(q.difficulty as string);
		if (isDifficultyKey(diffInt)) {
			result.difficulty = diffInt;
		} else {
			result.difficulty = null;
		}
	}
	if (q.dimensions) {
		if (typeof q.dimensions === 'string') {
			result.dimensions = q.dimensions as DimensionStr;
		} else {
			result.dimensions = null;
		}	
	}
	if (q.favorite) {
		const favBool = q.favorite === 'true';
		if (favBool) {
			result.favorite = favBool;
		} else {
			result.favorite = null;
		}
	}
	if (q.records) {
		if (typeof q.record === 'string') {
			result.records = q.records as any;
		} else {
			result.records = null;
		}
	}

	return result;
}

const route = useRoute();
const router = useRouter();
onBeforeMount(() => {
	const parsed = parseQueryParams(route.query);
	applyParsedQueryParams(parsed);
})

function updateRouteQuery(actual: HistoryParsedQueryData) {
	// Set all query params based on data, but omit any that are equal to the defaults
	const defaults = getDefaults();

	const resultQuery: Record<string, string | number | string[]> = {
		...route.query,
		page: actual.page,
		pageSize: actual.pageSize,
		sort: actual.sortBy,
		sortDir: actual.sortDir,
		// TODO: filters array (merge)
		filters: []
	}

	// Remove any keys from resultQuery where actual is equal to defaults
	if (actual.page === defaults.page) {
		delete resultQuery.page;
	}
	if (actual.pageSize === defaults.pageSize) {
		delete resultQuery.pageSize;
	}
	if (actual.sortBy === defaults.sortBy) {
		delete resultQuery.sort;
	}
	if (actual.sortDir === defaults.sortDir) {
		delete resultQuery.sortDir;
	}
	// TODO: filters
	router.replace({ path: route.path, query: resultQuery })
}

watch(data, (value) => {
	// Update route query params based on data
	updateRouteQuery(value);
}, { deep: true });
</script>