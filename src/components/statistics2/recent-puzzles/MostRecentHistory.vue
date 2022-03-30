<template>
	<section>
		<header class="flex flex-row items-center justify-between px-4  py-2">
			<h3 class="text-gray-600 text-base font-medium">Most recent puzzles</h3>
			<router-link
				class="text-sm text-gray-500"
				to="/history"
			>View all &gt;</router-link>
		</header>
		<ol class="flex flex-col divide-y divide-gray-100 w-full pb-1">
			<RecentPuzzleItem
				v-for="item in mostRecentItems"
				:key="item.id"
				:date="item.date"
				:dimensions="item.dimensions"
				:difficulty="item.difficulty"
				:time="item.timeElapsed"
			/>
		</ol>
	</section>
</template>

<script setup>
import { useStatisticsStore2 } from '@/stores/statistics2.js';

import { computed, toRef } from 'vue';
import RecentPuzzleItem from './RecentPuzzleItem.vue';
const store = useStatisticsStore2();

const sortedByDate = toRef(store, 'sortedByDate');
const mostRecentItems = computed(() => sortedByDate.value?.slice(0, 10) ?? []);
</script>

<style scoped>

</style>