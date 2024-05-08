<template>
<div class="bg-white pt-4">
	<label class="text-xs flex flex-row items-center px-4 pb-2"><span>Amount per page:</span>
		<select
			v-model.number="pageSize"
			class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-xs"
		>
			<option value="10">10</option>
			<option value="25">25</option>
			<option value="50">50</option>
			<option value="100">100</option>
		</select>
	</label>
	<div class="bg-white border-b pb-4">
		<div class="px-4 pt-2 pb-2 flex items-center justify-between">
			<label class="text-xs flex flex-row items-center"><span>Sort by:</span>
				<select
					v-model="sortSelection"
					class="form-select text-black rounded border border-gray-400 py-1 pr-[4.5ch] pl-1 text-xs"
				>
					<option value="date;desc">Newest first</option>
					<option value="date;asc">Oldest first</option>
					<option value="time;asc">Time: fastest first</option>
					<option value="time;desc">Time: slowest first</option>
				</select>
			</label>
			<BaseButton
				class="text-sm"
				:class="{ 'btn-primary': showFilters }"
				@click="() => showFilters = !showFilters"
			>
				<span v-if="showFilters">Hide filters</span>
				<span v-else>Show filters</span>
			</BaseButton>
		</div>

		<ExpandTransition :show="showFilters">
			<div>
			
			</div>
		</ExpandTransition>

	</div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHistoryFilterSortPaginate } from '../composables/history-filter-sort-paginate.js';

const { sortSelection, pageSize, favorite } = useHistoryFilterSortPaginate();

const setFavoritesOnly = (val: boolean) => {
	if (val) favorite.value = true;
	else favorite.value = null;
}

const showFilters = ref(false);
</script>

<style scoped>
.form-select {
	@apply ml-4;
}
</style>