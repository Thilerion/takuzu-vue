<template>
	<section>
		<header class="flex flex-row items-center justify-between px-4  pb-2 pt-4">
			<h3 class="text-gray-500 text-sm font-medium uppercase tracking-wider">Recent puzzles</h3>
			<router-link
				class="text-teal-700 hover-hover:hover:text-teal-500 active:text-teal-500 flex flex-row items-center"
				to="/stats/history"
			><div class="text-xs font-medium uppercase tracking-wider">View all</div><icon-ic-baseline-chevron-right class="text-xs w-5 h-5" /></router-link>
		</header>
		<ol class="flex flex-col divide-y divide-gray-100 w-full pb-1">
			<ul class="mx-3" v-for="item in mostRecentItems" :key="item.id"> 
				<RecentPuzzleItem
					:key="item.id"
					:date="item.date"
					:dimensions="item.dimensions"
					:difficulty="item.difficulty"
					:time="item.timeElapsed"
				/>
			</ul>
		</ol>
	</section>
</template>

<script setup>
import { useStatisticsStore } from '@/stores/statistics.js';

import { computed, toRef } from 'vue';

const store = useStatisticsStore();

const sortedByDate = toRef(store, 'sortedByDate');
const mostRecentItems = computed(() => sortedByDate.value?.slice(0, 6) ?? []);
</script>

<style scoped>

</style>