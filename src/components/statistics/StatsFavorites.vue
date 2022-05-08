<template>
	<div class="px-4 text-gray-600">
		<header class="flex justify-between items-end">
			<h2 class="text-gray-600 text-lg font-medium px-1 pt-2 pb-1">Favorites</h2>
			<router-link
				class="text-teal-700 hover-hover:hover:text-teal-500 active:text-teal-500 flex flex-row items-center pb-1.5"
				to="/stats/table"
			>
				<div
					class="text-xs font-medium uppercase tracking-wider"
					>View more</div>
				<icon-ic-baseline-chevron-right class="text-xs w-5 h-5" />
			</router-link>
		</header>
		
		<div class="bg-white rounded shadow-lg shadow-gray-600/10 py-2 pt-3 px-3 flex flex-col divide-y">
			<div class="pb-2">
<h3 class="text-gray-500 text-sm font-medium uppercase tracking-wider">Most played</h3>
			<div class="text-sm flex flex-row justify-between leading-loose max-w-sm">
				<div class="text-left w-1/5">
					<div class="">Puzzle</div>
					<div class="">Size</div>
				</div>
				<div class="flex-1">
					<div class="text-right">{{mostPlayedPuzzleConfig.key}}</div>
					<div class="text-right">{{mostPlayedPuzzleSize.key}}</div>
				</div>
				<div class="flex-none w-[14ch]">
					<div class="text-right">{{mostPlayedPuzzleConfig.summary.count}}</div>
					<div class="text-right">{{mostPlayedPuzzleSize.summary.count}}</div>
				</div>
			</div>
			</div>
			<div class="pt-2">
<h3 class="text-gray-500 text-sm font-medium uppercase tracking-wider">Longest playtime</h3>
			<div class="text-sm flex flex-row justify-between leading-loose max-w-sm">
				<div class="text-left w-1/5">
					<div class="">Puzzle</div>
					<div class="">Size</div>
				</div>
				<div class="flex-1">
					<div class="text-right">{{longestPlaytimePuzzleConfig.key}}</div>
					<div class="text-right">{{longestPlaytimePuzzleSize.key}}</div>
				</div>
				<div class="flex-none w-[14ch]">
					<div class="text-right">{{formatTimeHHMMSS(longestPlaytimePuzzleConfig.summary.sum)}}</div>
					<div class="text-right">{{formatTimeHHMMSS(longestPlaytimePuzzleSize.summary.sum)}}</div>
				</div>
			</div>
			</div>
			

		</div>
	</div>
</template>

<script setup>
import { useStatisticsStore } from '@/stores/statistics';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { formatTimeHHMMSS } from '@/utils/date.utils';

const statsStore = useStatisticsStore();

const {
	summariesByDimensionsAllTime,
	summariesByPuzzleConfigsAllTime,
} = storeToRefs(statsStore);

const mostPlayedPuzzleSize = computed(() => {
	return summariesByDimensionsAllTime.value.byPlayed[0];
})
const longestPlaytimePuzzleSize = computed(() => {
	return summariesByDimensionsAllTime.value.byPlaytime[0];
})
const mostPlayedPuzzleConfig = computed(() => {
	return summariesByPuzzleConfigsAllTime.value.byPlayed[0];
})
const longestPlaytimePuzzleConfig = computed(() => {
	return summariesByPuzzleConfigsAllTime.value.byPlaytime[0];
})

</script>

<style scoped>

</style>