<template>
<div
	class="bg-gradient-to-r from-80% from-white to-transparent text-gray-500 text-right pr-[0.75rem] pl-1 w-fit sticky left-0 top-0 h-full weekdays text-xxs"
	:style="{
		'grid-row': row,
		'grid-column': column,
	}"
>
	<div
		v-for="{ idx, value: weekday } in shownWeekdays"
		:key="weekday"
		:style="{ 'grid-row': `${idx + 2} / span 1` }"
		class="flex items-center justify-end text-right"
	>{{ weekday }}</div>
</div>
</template>

<script setup lang="ts">
import { eachDayOfInterval, endOfWeek, startOfWeek, type Day } from 'date-fns';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(defineProps<{
	row: `${string} / ${string}`,
	column: `${string} / ${string}`,
	weekStart?: Day,
	shownIdx?: number[]
}>(), {
	weekStart: 1, /* monday */
	shownIdx: () => ([1, 3, 5])
});

const now = new Date();

const weekInterval = computed(() => {
	const start = startOfWeek(now, { weekStartsOn: props.weekStart /*  monday */});
	const end = endOfWeek(now, { weekStartsOn: props.weekStart /*  monday */});
	return { start, end };
})
const { locale } = useI18n();
const weekdays = computed(() => {
	const intl = new Intl.DateTimeFormat(locale.value, { weekday: 'short' });
	const days: string[] = [];
	eachDayOfInterval(weekInterval.value).forEach((date) => {
		days.push(intl.format(date));
	});
	return days;
})
const shownWeekdays = computed((): { idx: number, value: string }[] => {
	return props.shownIdx.map((idx) => ({ value: weekdays.value[idx], idx }));
})

</script>

<style scoped>
.weekdays {
	display: grid;
	grid-template-rows: subgrid;
}
</style>