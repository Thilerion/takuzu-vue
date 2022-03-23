<template>
	<div class="flex flex-col">
		<PageHeader hide-back>Statistics</PageHeader>
		<div class="content flex-1">
			<div
				class="empty-content bg-white text-center mx-6 px-2 py-4 rounded-md shadow-md relative leading-loose mt-[8vh]"
				v-if="isLoading || statsStore.noPuzzlesSolved"
			>
				<div v-if="isLoading">Loading statistics...</div>
				<div v-else-if="statsStore.noPuzzlesSolved">
					<div>You haven't solved any puzzles yet! Go play some!</div>
				</div>
			</div>
			<StatisticsContent v-else />
		</div>
		<StatsDbUtils
			@update-stats="updateStats"
			:num-solved="statsStore.puzzlesSolved"
		/>
	</div>
</template>

<script setup>
import { onBeforeMount } from 'vue';
import PageHeader from '../components/global/base-layout/PageHeader.vue';
import StatsDbUtils from '../components/statistics2/StatsDbUtils.vue';
import StatisticsContent from '../components/statistics2/StatisticsContent.vue';
import { useStatisticsStore2 } from '@/stores/statistics2.js';
import { getUniqueDatesFromItems } from '../services/stats2/dates.js';
import { processDateStreaks } from '../services/stats2/streaks.js';
import { storeToRefs } from 'pinia';

const statsStore = useStatisticsStore2();
const { isLoading } = storeToRefs(statsStore);
const updateStats = () => initAndUpdate(true);

onBeforeMount(() => {
	initAndUpdate();
})

async function initAndUpdate(forceUpdate = false) {
	// initialize, or reload if data might have changed
	await statsStore.initialize({ forceUpdate });

	const items = statsStore.historyItems;
/* 	items[items.length - 1].dateStr = '2022-3-16';
	items[items.length - 2].dateStr = '2022-3-15';
	items[items.length - 3].dateStr = '2022-3-14'; */
	const dates = getUniqueDatesFromItems(items);

	const streaks = processDateStreaks(dates.map(d => d.date));
}
</script>

<style scoped>

</style>