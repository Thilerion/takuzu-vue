<template>
	<div class="flex flex-col">
		<PageHeader hide-back small elevated :transparent="false" class="mb-4">Statistics</PageHeader>
		<div class="content flex-1 pb-3">
			<div
				class="empty-content bg-white text-center mx-6 px-2 py-4 rounded-md shadow-md relative leading-loose mt-[8vh]"
				v-if="isLoading || statsStore.noPuzzlesSolved"
			>
				<div v-if="isLoading">Loading statistics...</div>
				<div v-else-if="statsStore.noPuzzlesSolved">
					<div>You haven't solved any puzzles yet! Go play some!</div>
				</div>
			</div>
			<StatisticsContent v-else-if="!statsStore.noPuzzlesSolved" />
			<div v-else>Woops...</div>
		</div>
		<div class="pt-6">
			<StatsDbUtils
				@update-stats="updateStats"
				:num-solved="statsStore.puzzlesSolved"
			/>
		</div>
			
	</div>
</template>

<script setup>
import { onBeforeMount } from 'vue';
import StatsDbUtils from '../components/statistics/StatsDbUtils.vue';
import StatisticsContent from '../components/statistics/StatisticsContent.vue';
import { useStatisticsStore } from '@/stores/statistics.js';
import { storeToRefs } from 'pinia';
import PageHeader from '@/components/global/base-layout/PageHeader.vue';

const statsStore = useStatisticsStore();
const { isLoading } = storeToRefs(statsStore);
const updateStats = () => initAndUpdate(true);

onBeforeMount(() => {
	initAndUpdate();
})

async function initAndUpdate(forceUpdate = false) {
	// initialize, or reload if data might have changed
	await statsStore.initialize({ forceUpdate });
}
</script>

<style scoped>

</style>