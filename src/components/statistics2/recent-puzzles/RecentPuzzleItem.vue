<template>
	<li
		class="px-4 py-2 text-sm flex flex-row items-center justify-start gap-2"
	>
		<div class="flex-1 flex-grow-[5] min-w-max">{{formattedDate}}</div>
		<div class="text-left w-[6.5ch] flex-auto flex-grow-1">{{dimensions}}</div>
		<div class="min-w-[4ch] flex-1 flex-grow-1">{{difficulty}}*</div>
		<div class="ml-auto w-max min-w-max pl-2">{{formattedTime}}</div>
	</li>
</template>

<script>
import { timeFormatter } from '@/utils/date.utils.js';
import { computed } from 'vue';

const formatTime = timeFormatter({});
const dateTimeOpts = {
	// weekday: 'short',
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	// second: 'numeric'
}
const formatDate = (date) => date.toLocaleString(undefined, dateTimeOpts);
</script>

<script setup>
const props = defineProps({
	date: Date,
	dimensions: String,
	difficulty: [String, Number],
	time: Number
});

const formattedDate = computed(() => formatDate(props.date));
const formattedTime = computed(() => formatTime(props.time));
</script>

<style scoped>

</style>