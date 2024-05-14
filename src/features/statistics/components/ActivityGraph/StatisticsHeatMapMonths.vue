<template>
<div
	class="bg-white text-gray-500 h-auto leading-none months text-xxs"
	:style="{
		'grid-row': row,
		'grid-column': column,
	}"
>
	<div
		v-for="range in monthColumnRanges"
		:key="range.colStart"
		:class="{ 'text-right': range.alignRight }"
		:style="{
			'grid-column-start': `${range.colStart + 1}`,
			'grid-column-end': `${range.colEnd + 1}`,
			'grid-row': '1 / span 1',
		}"
	>{{ range.monthStr }}</div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HeatmapRangeBaseCell } from '../../helpers/heatmap-base-data.js';
import { useI18n } from 'vue-i18n';
import { setMonth, type Month } from 'date-fns';

const props = defineProps<{
	row: `${string} / ${string}`,
	column: `${string} / ${string}`,
	cells: HeatmapRangeBaseCell[]
}>();

const { locale } = useI18n();
const monthStrings = computed(() => {
	const intl = new Intl.DateTimeFormat(locale.value, { month: 'short' });
	const baseDate = new Date();
	const result: Map<Month, string> = new Map();
	for (let i: Month = 0; i < 12; i++) {
		result.set(i as Month, intl.format(setMonth(baseDate, i)));
	}
	return result;
})

type MonthRange = {
    month: Month;
	year: number;
    colStart: number;
    colEnd: number;
	alignRight?: boolean;
}
const getMonthsList = (cells: HeatmapRangeBaseCell[]) => {
	const monthsMap: Map<`${number}-${number}`, { start: number, end: number }> = new Map();

	for (const { year, month, weekIndex } of cells) {
		const key = `${year}-${month}` as const;
		if (!monthsMap.has(key)) {
			monthsMap.set(key, { start: weekIndex, end: weekIndex });
		} else {
			const monthRange = monthsMap.get(key)!;
            if (weekIndex < monthRange.start) {
                monthRange.start = weekIndex;
            }
            if (weekIndex > monthRange.end) {
                monthRange.end = weekIndex;
            }
		}
	}

	const res: MonthRange[] = [];

	monthsMap.forEach((range, key) => {
		const [year, month] = key.split('-').map(Number);
		res.push({
			month: month as Month, year,
			colStart: range.start + 1,
			colEnd: range.end + 1
		});
	});

	res.sort((a, b) => {
		return a.colStart - b.colStart;
	})
	
	// Potentially update first and last displayed months, to get them to fit the grid
	// If the last month is only 1 column(/week) wide, set its colStart to 1 lower, and add the "alignRight" boolean property
	const lastMonth = res.at(-1)!;
	if (lastMonth.colEnd - lastMonth.colStart === 1) {
		lastMonth.colStart -= 1;
		lastMonth.alignRight = true;
	}
	// If the first month is only 1 column(/week) wide, remove it
	if (res[0].colEnd - res[0].colStart === 0) {
		res.shift();
	}

	return res;
}

const monthColumnRanges = computed(() => {
	const ranges = getMonthsList(props.cells);
	return ranges.map(r => {
		return {
			...r,
			monthStr: monthStrings.value.get(r.month as Month)!,
		}
	})
})
</script>

<style scoped>
.months {
	display: grid;
	grid-template-columns: subgrid;
	grid-template-rows: 1fr;
}
</style>

