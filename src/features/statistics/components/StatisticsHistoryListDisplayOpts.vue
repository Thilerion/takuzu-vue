<template>
<div class="bg-white dark:bg-slate-800 pt-4">
	<label class="text-xs flex flex-row items-center px-4 pb-2"><span>{{ $t('Paginate.amount-per-page') }}:</span>
		<select
			v-model.number="pageSize"
			class="ml-4 text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-xs"
		>
			<option value="10">10</option>
			<option value="25">25</option>
			<option value="50">50</option>
			<option value="100">100</option>
		</select>
	</label>
	<div class="bg-white dark:bg-slate-800 border-b dark:border-slate-600 pb-2">
		<div class="px-4 pt-2 pb-2 flex items-center justify-between">
			<label class="text-xs flex flex-row items-center whitespace-nowrap"><span>{{ $t('Statistics.History.sort.sort-by') }}</span>
				<select
					v-model="sortSelection"
					class="ml-4 text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-xs"
				>
					<option value="date;desc">{{ $t('Statistics.History.sort.newest-first') }}</option>
					<option value="date;asc">{{ $t('Statistics.History.sort.oldest-first') }}</option>
					<option value="time;asc">{{ $t('Statistics.History.sort.time-fastest-first') }}</option>
					<option value="time;desc">{{ $t('Statistics.History.sort.time-slowest-first') }}</option>
				</select>
			</label>
		</div>
		<div class="pl-2 pr-4 pt-2 w-full border-t mt-2 dark:border-slate-600">
			<button
				class="flex whitespace-nowrap items-center text-xs text-start px-2 py-1 w-max"
				@click="() => showFilters = !showFilters"
			>
				<div class="flex-1 min-w-28">
					<span v-if="showFilters">{{ $t('Statistics.History.filter.hide-filters') }}</span>
					<span v-else>{{ $t('Statistics.History.filter.show-filters') }}</span>
				</div>
				<icon-ic-outline-keyboard-arrow-down
					class="transition-transform duration-500"
					:class="showFilters ? 'rotate-180' : 'rotate-0'"
				/>
			</button>
		</div>

		<ExpandTransition :show="showFilters">
			<StatisticsHistoryListFilters
				v-model:favorite="favoriteModel"
				v-model:difficulty="difficultyModel"
				v-model:dimensions="dimensionsModel"
			/>
		</ExpandTransition>

	</div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHistoryFilterSortPaginate } from '../composables/history-filter-sort-paginate.js';
import { computed } from 'vue';
import type { DifficultyKey, DimensionStr } from '@/lib/types.js';

const {
	sortSelection,
	pageSize,
	favorite,
	dimensions,
	difficulty,
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

const showFilters = ref(false);
</script>