<template>
	<div
		class="px-1 py-2 text-xs flex flex-row items-center justify-between gap-4 max-w-xl min-w-0 overflow-x-hidden"
	>
		<div class="min-w-max w-[18ch] flex-nowrap flex flex-row gap-4 text-left">
			<div class="whitespace-nowrap flex-1">{{fDateTime.date}}</div>
			<div class="whitespace-nowrap flex-none">{{fDateTime.time}}</div>
		</div>
		<div class="overflow-hidden text-ellipsis whitespace-nowrap inline-block text-center w-12">{{dimensions}}</div>
		<div class="overflow-hidden text-ellipsis whitespace-nowrap inline-block text-center w-7">{{difficulty}}*</div>
		<span class="inline-block text-right min-w-max w-1/5">{{formattedTime}}</span>
	</div>
</template>

<script>
import { timeFormatter } from '@/utils/date.utils.js';
import { differenceInCalendarDays } from 'date-fns/esm';
import { computed } from 'vue';

const formatTime = timeFormatter({});
const dateTimeOpts = {
	// weekday: 'short',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	// second: 'numeric'
}
const formatDate = (date) => date.toLocaleString(undefined, dateTimeOpts);
const formatDateTime = (date) => date.toLocaleTimeString(undefined, {
	hour: '2-digit',
	minute: '2-digit'
});

const rtf = new Intl.RelativeTimeFormat(undefined, {
	localeMatcher: 'best fit',
	numeric: 'auto',
	style: 'long'
})
const formatRelative = (date, diffDays) => {
	const d = rtf.format(diffDays, 'days');
	const time = formatDateTime(date);
	return d + ' ' + time;
}
const today = new Date();
</script>

<script setup>
const props = defineProps({
	date: Date,
	dimensions: String,
	difficulty: [String, Number],
	time: Number
});

const diffDays = computed(() => differenceInCalendarDays(today, props.date));

const d = computed(() => {
	const date = new Date(props.date * 1);
	const h = date.getHours();
	if (h > 15 && h < 17) {
		date.setHours(8);
	}
	return date;
})

const _formattedDate = computed(() => {
	if (diffDays.value < 1) {
		return formatRelative(d.value, diffDays.value);
	}
	return formatDate(d.value);
});
const fDateTime = computed(() => {
	const fd = _formattedDate.value;
	const split = fd.split(' ');
	const time = split.pop();
	const date = split.join(' ');
	return { time, date };

})
const formattedTime = computed(() => formatTime(props.time));
</script>

<style scoped>

</style>