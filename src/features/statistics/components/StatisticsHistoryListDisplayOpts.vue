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
	<div class="py-2 px-2">
		<InputToggle
			id="favoritesOnlyToggle"
			:model-value="favorite === true"
			class="mb-0 w-full font-medium"
			@update:model-value="setFavoritesOnly"
		>Favorites only</InputToggle>
	</div>
</div>
</template>

<script setup lang="ts">
import { useHistoryFilterSortPaginate } from '../composables/history-filter-sort-paginate.js';

const { sortSelection, pageSize, favorite } = useHistoryFilterSortPaginate();

const setFavoritesOnly = (val: boolean) => {
	if (val) favorite.value = true;
	else favorite.value = null;
}
</script>

<style scoped>
.form-select {
	@apply ml-4;
}
</style>