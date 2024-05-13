<template>
<div class="py-0 filters-box px-4 grid gap-4 text-sm">
	<div>
		<InputToggle
			id="favoritesOnlyToggle"
			v-model="favoritesOnly"
			class="mb-0 w-full font-medium text-sm"
			small
		>{{ $t('Statistics.History.filter.favorites-only') }}</InputToggle>
	</div>

	<div class="history-select-filter">
		<label for="difficultySelect" class="block font-medium mb-2">{{ $t('Game.difficulty.label') }}:</label>
		<button
			class="clear-btn"
			:disabled="difficulty == null"
			@click="difficulty = null"
		><icon-ic-baseline-close class="inline-block" />{{ $t('Statistics.History.filter.remove-filter') }}</button>
		<HistoryListDifficultyFilter
			id="difficultySelect"
			v-model="difficulty"
		/>
	</div>

	<div class="history-select-filter">
		<label for="dimensionsSelect" class="block font-medium mb-2">{{ $t('Game.board-size.label') }}:</label>
		<button
			class="clear-btn"
			:disabled="dimensions == null"
			@click="dimensions = null"
		><icon-ic-baseline-close class="inline-block" />{{ $t('Statistics.History.filter.remove-filter') }}</button>
		<HistoryListBoardSizeFilter
			id="dimensionsSelect"
			v-model="dimensions"
		/>
	</div>

	<div>
		<div class="block font-medium mb-2">{{ $t('Statistics.History.filter.record') }}:</div>
		<HistoryListRecordFilter
			v-model="records"
		/>
	</div>
	<div class="w-full">
		<button
			class="inline-block w-fit pt-2 text-red-600 disabled:text-gray-400 clear-btn"
			:disabled="!activeFilters"
			@click="$emit('clear-filters')"
		><icon-ic-baseline-close class="inline-block" />{{ $t('Statistics.History.filter.remove-all-filters') }}</button>
	</div>
</div>
</template>

<script setup lang="ts">
import type { DifficultyKey, DimensionStr } from '@/lib/types.js';
import type { HistoryRecordFilter } from '../../helpers/history-filter.js';

defineEmits<{
	(e: 'clear-filters'): void;
}>();
defineProps<{
	activeFilters: number;
}>();

const favoritesOnly = defineModel<boolean>('favorite', { required: true });
const difficulty = defineModel<DifficultyKey | null>('difficulty', { required: true });
const dimensions = defineModel<DimensionStr | null>('dimensions', { required: true });
const records = defineModel<NonNullable<HistoryRecordFilter> | ''>('records', { required: true });
</script>

<style scoped>
.filters-box {
	@apply max-w-md mr-auto;
}
.filters-box > *:first-child {
	@apply pt-4;
}
.filters-box > *:last-child {
	@apply pb-4;
}

.history-select-filter {
	@apply grid;
	grid-template-areas:
		"label clear"
		"select select";
	grid-template-columns: 1fr auto;
}
.history-select-filter label {
	grid-area: label;
}
.history-select-filter select {
	grid-area: select;
}
.history-select-filter .clear-btn {
	grid-area: clear;
}
.clear-btn {
	@apply transition-all text-red-600 dark:text-red-400 disabled:opacity-40 dark:disabled:opacity-100 disabled:text-black dark:disabled:text-slate-400;
	@apply flex items-center justify-center gap-x-1;
}
.clear-btn svg {
	@apply inline-block mb-0.5;
}

</style>
