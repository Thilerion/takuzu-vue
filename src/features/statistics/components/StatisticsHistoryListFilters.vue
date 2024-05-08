<template>
<div class="py-0 filters-box px-4 grid gap-4 text-sm">
	<div class="pt-4">
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
		>{{ $t('Statistics.History.filter.remove-filter') }}</button>
		<select
			id="difficultySelect"
			v-model="difficulty"
			class="w-full text-sm"
		>
			<option 
				v-for="opt in difficultyOptions"
				:key="opt.value ?? 'any'"
				:value="opt.value"
			><span v-if="opt.value != null">{{ opt.value }}* - </span>{{ opt.label }}</option>
		</select>
	</div>

	<div class="history-select-filter">
		<label for="dimensionsSelect" class="block font-medium mb-2">{{ $t('Game.board-size.label') }}:</label>
		<button
			class="clear-btn"
			:disabled="dimensions == null"
			@click="dimensions = null"
		>{{ $t('Statistics.History.filter.remove-filter') }}</button>
		<HistoryListBoardSizeFilter
			id="dimensionsSelect"
			v-model="dimensions"
		/>
	</div>
</div>
</template>

<script setup lang="ts">
import { DIFFICULTY_LABELS } from '@/config.js';
import type { DifficultyKey, DimensionStr } from '@/lib/types.js';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const favoritesOnly = defineModel<boolean>('favorite', { required: true });
const difficulty = defineModel<DifficultyKey | null>('difficulty', { required: true });
const dimensions = defineModel<DimensionStr | null>('dimensions', { required: true });

const { t } = useI18n();
const difficultyOptions = computed(() => {
	const keys = Object.keys(DIFFICULTY_LABELS) as any[] as DifficultyKey[];
	const result: { value: DifficultyKey | null, label: string }[] = [
		{ value: null, label: t('Statistics.History.filter.any') }
	];

	for (const key of keys) {
		const label = DIFFICULTY_LABELS[key];
		const labelMsg = t(`Game.difficulty.${label}`);
		result.push({ value: key, label: labelMsg });
	}
	return result;
})
</script>

<style scoped>
.filters-box {
	@apply max-w-md mr-auto;
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
	@apply transition-all text-red-600 dark:text-red-400 disabled:opacity-40 disabled:text-black dark:disabled:text-slate-100;
}

</style>