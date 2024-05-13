<template>
<div
	class="grid"
>
	<label
		v-for="opt in timeRecordOpts"
		:key="opt.label"
		class="leading-loose block whitespace-nowrap"
	>
		<input
			v-model="modelValue"
			type="radio"
			:value="opt.value"
			name="timeRecordFilterRadio"
		>
		<span class="ml-1.5 whitespace-nowrap">{{ opt.label }}</span>
	</label>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HistoryRecordFilter } from '../../helpers/history-filter.js';
import { useI18n } from 'vue-i18n';

const modelValue = defineModel<NonNullable<HistoryRecordFilter> | ''>({ required: true });

const { t } = useI18n();
const timeRecordOpts = computed((): { value: NonNullable<HistoryRecordFilter> | '', label: string }[] => [
	{ label: t('Statistics.History.filter.no-filter'), value: '' },
	{ label: t('Statistics.History.filter.all-time-records'), value: 'time-all' },
	{ label: t('Statistics.History.filter.only-current-records'), value: 'time-current' },
	{ label: t('Statistics.History.filter.only-first-solves'), value: 'first' }
]);
</script>

<style scoped>
.grid {
	@apply w-full grid-cols-2;
	grid-template-rows: 1fr 1fr;
}
</style>