<template>
<div>
	<label class="text-sm flex flex-row items-center px-2 pb-2"><span>Amount per page:</span>
		<select
			v-model.number="pageSize"
			class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-sm"
		>
			<option value="10">10</option>
			<option value="25">25</option>
			<option value="50">50</option>
			<option value="100">100</option>
		</select>
	</label>
	<label class="text-sm flex flex-row items-center px-2 pb-2"><span>Sort by:</span>
		<select
			v-model="sortSelection"
			class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-sm"
		>
			<option value="date;desc">New > Old</option>
			<option value="date;asc">Old > New</option>
			<option value="time;asc">Fastest > Slowest</option>
			<option value="time;desc">Slowest > Fastest</option>
		</select>
	</label>
</div>
</template>

<script setup lang="ts">
import type { HistorySortSelection } from '../helpers/history-sort.js';

const sortSelection = defineModel<HistorySortSelection>('sortSelection', { required: true });
const pageSize = defineModel<number>('pageSize', { required: true });

</script>

<style scoped>
.form-select {
	@apply ml-4;
}
</style>