<template>
<h2 class="text-lg font-medium pb-2">Most recent puzzles</h2>
	<div class="flex flex-col text-sm divide-y shadow-md bg-white rounded">
		<div
			v-for="puzzle in mostRecent"
			class="px-4 py-2 flex items-center justify-between"
		>
			<div class="w-16">{{puzzle.dimensionDifficultyStr}}</div>
			<div class="flex-1 text-center">{{puzzle.dateStr}}</div>
			<div class="w-12 ml-auto text-right">{{puzzle.timeElapsed}}</div>
		</div>
	</div>
</template>

<script setup>
import { useStatisticsStore } from '@/stores/statistics.js';
import { timeFormatter } from '@/utils/date.utils.js';
import { computed, ref, toRef } from 'vue';

const msToMinSec = timeFormatter({ padMinutes: false });

const statsStore = useStatisticsStore();

const historyItems = toRef(statsStore, 'historyItems');

const showAmount = ref(10);

const mostRecent = computed(() => {
	const items = historyItems.value.slice(-showAmount.value);

	return [...items].reverse().map(item => {
		const timeElapsed = msToMinSec(item.timeElapsed);
		return {...item, timeElapsed};
	})
})
</script>

<style scoped>

</style>