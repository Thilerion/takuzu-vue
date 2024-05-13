<template>
<div class="bg-white dark:bg-slate-800 pt-4">
	<div class="pagesize-sort px-4 gap-y-2 gap-x-3 pb-2 max-w-md">
		<label class="text-xs flex flex-row items-center"><span>{{ $t('Paginate.amount-per-page') }}:</span>
			<select
				v-model.number="pageSize"
				class="text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-2 text-xs min-w-fit"
			>
				<option value="10">10</option>
				<option value="25">25</option>
				<option value="50">50</option>
				<option value="100">100</option>
			</select>
		</label>
		<label class="text-xs flex flex-row items-center whitespace-nowrap">
			
			<div class="flex items-center gap-x-1"><icon-ic-baseline-sort class="inline-block" />{{ $t('Statistics.History.sort.sort-by') }}</div>
			<select
				v-model="sortSelection"
				class="text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-2 text-xs min-w-fit"
			>
				<option value="date;desc">{{ $t('Statistics.History.sort.newest-first') }}</option>
				<option value="date;asc">{{ $t('Statistics.History.sort.oldest-first') }}</option>
				<option value="time;asc">{{ $t('Statistics.History.sort.time-fastest-first') }}</option>
				<option value="time;desc">{{ $t('Statistics.History.sort.time-slowest-first') }}</option>
			</select>
		</label>
	</div>
	<div class="bg-white dark:bg-slate-800 border-b dark:border-slate-600 pb-1">
		<div class="px-0 w-full border-t mt-2 dark:border-slate-600">
			<button
				class="flex whitespace-nowrap items-center text-xs text-start px-4 pb-2 pt-3 w-full"
				@click="() => showFilters = !showFilters"
			>
				<icon-ic-outline-filter-list class="flex-none mb-0.5 mr-1 w-5 h-5 inline-block text-sm text-gray-600 dark:text-slate-300" />
				<div class="flex-1 min-w-32">
					<span v-if="showFilters">{{ $t('Statistics.History.filter.hide-filters') }}</span>
					<span v-else>{{ $t('Statistics.History.filter.show-filters') }}</span>
					<span
						class="ml-1 transition-opacity opacity-100 font-medium"
						:class="{ 'opacity-70 font-base': numActiveFilters === 0 }"
					>{{ $t('Statistics.History.filter.n-active-filters', [numActiveFilters]) }}</span>
				</div>
				<icon-ic-outline-keyboard-arrow-down
					class="transition-transform duration-500 text-base text-gray-700 dark:text-slate-200"
					:class="showFilters ? 'rotate-180' : 'rotate-0'"
				/>
			</button>
		</div>

		<ExpandTransition :show="showFilters">
			<StatisticsHistoryListFilters
				v-model:favorite="favoriteModel"
				v-model:difficulty="difficultyModel"
				v-model:dimensions="dimensionsModel"
				v-model:records="recordsModel"
				:active-filters="numActiveFilters"
				@clear-filters="clearAllFilters"
			/>
		</ExpandTransition>

	</div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHistoryFilterSortPaginate } from '../../composables/history-filter-sort-paginate.js';
import { computed } from 'vue';
import type { DifficultyKey, DimensionStr } from '@/lib/types.js';
import type { HistoryRecordFilter } from '../../helpers/history-filter.js';

const {
	sortSelection,
	pageSize,
	favorite,
	dimensions,
	difficulty,
	records,
	numActiveFilters,
	clearAllFilters,
} = useHistoryFilterSortPaginate();

const favoriteModel = computed({
	get: () => favorite.value === true,
	set: (val: boolean) => {
		if (val) favorite.value = true;
		else favorite.value = null;
	}
})
const difficultyModel = computed({
	get: () => difficulty.value,
	set: (val: string | number | null) => {
		if (val === 'null' || val == null) difficulty.value = null;
		else if (typeof val === 'number') {
			difficulty.value = val as DifficultyKey;
		} else {
			difficulty.value = Number(val) as DifficultyKey;
		}
	}
})
const dimensionsModel = computed({
	get: () => dimensions.value,
	set: (val: string | number | null) => {
		if (val === 'null' || val == null) dimensions.value = null;
		else dimensions.value = val as DimensionStr;
	}
})

const recordsModel = computed({
	get: () => {
		const v = records.value;
		if (v == null) return '';
		return v;
	},
	set: (val: NonNullable<HistoryRecordFilter> | '' | 'null') => {
		if (val == null || val === 'null' || val === '') records.value = null;
		else records.value = val as HistoryRecordFilter;
	}
})

const showFilters = ref(false);
</script>

<style scoped>
.pagesize-sort {
	@apply grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
}
.pagesize-sort > * {
	grid-row: 1 / -1;
	display: grid;
	grid-template-rows: subgrid;
}
</style>