<template>
	<div>
		<div class="flex justify-between items-center pb-4 px-2">
			<label class="text-sm flex flex-row items-center gap-3"><span>Per page:</span>
				<select
					:value="pageSize"
					@change="updatePageSize(parseInt(($event.target as HTMLSelectElement).value))"
					class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-sm">
					<option :value="15">15</option>
					<option :value="30">30</option>
					<option :value="50">50</option>
					<option :value="100">100</option>
				</select>
			</label>

			<BaseButton @click="() => showFilters = !showFilters" :class="{ 'btn-primary': showFilters }"><span v-if="showFilters">Hide
					filters</span><span v-else>Show filters</span></BaseButton>
		</div>
		<label class="text-sm flex flex-row items-center px-2 pb-4"><span>Sort by:</span>
			<select :value="sortType" @change="$emit('change-sort-type', ($event.target as HTMLSelectElement).value as SortType)"
				class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-sm">
				<option value="newest">Newest first</option>
				<option value="oldest">Oldest first</option>
				<option value="fastestTime">Fastest time solved</option>
				<option value="slowestTime">Slowest time solved</option>
			</select>
		</label>
	</div>
</template>

<script setup lang="ts">
import type { SortType } from '@/views/usePuzzleHistorySorting.js';

const props = defineProps<{
	sortType: SortType,
	pageSize: number
}>();
const emit = defineEmits<{
	(ev: 'change-sort-type', val: SortType): void,
	(ev: 'change-page-size', val: number): void
}>();
const showFilters = defineModel<boolean>('showFilters');

const updatePageSize = (val: number) => {
	emit('change-page-size', val);
}
</script>

<style scoped></style>