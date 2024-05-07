<template>
<div class="content flex-1 flex flex-col gap-2 pt-4">
	<BasePagination
		:modelValue="currentPage - 1"
		:length="numItemsTotal"
		:page-size="currentPageSize"
		@update:model-value="(val) => currentPage = val + 1"
	/>
	<div>
		
	</div>
	<div>
		<label class="text-sm flex flex-row items-center px-2 pb-4"><span>Sort by:</span>
			<select
				v-model="sortSelection"
				class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-sm"
			>
				<option value="date;desc">Newest first</option>
				<option value="date;asc">Oldest first</option>
				<option value="time;asc">Fastest time solved</option>
				<option value="time;desc">Slowest time solved</option>
			</select>
		</label>
	</div>
	<transition name="fade" mode="out-in">
		
		<div
			v-if="historyItems && historyItems.length && !shownItems.length"
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
</template>

<script setup lang="ts">
import { useOffsetPagination } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useStatisticsNextStore } from '../store.js';

const page = defineModel<number>('page', { required: true });
const pageSize = defineModel<number>('pageSize', { required: true });
const sortBy = defineModel<string>('sortBy', { required: true });
const sortDir = defineModel<string>('sortDir', { required: true });
const filters = defineModel<unknown[]>('filters', { required: true });

const sortSelection = computed({
	get: () => {
		return `${sortBy.value};${sortDir.value}`;
	},
	set: (val: string) => {
		const [sort, dir] = val.split(';');
		sortBy.value = sort;
		sortDir.value = dir;
	}
})

const statsNextStore = useStatisticsNextStore();
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
	page,
	pageSize,
})

const shownItems = ref([]);
</script>

<style scoped>

</style>