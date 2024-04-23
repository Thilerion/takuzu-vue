<template>
	<div class="flex flex-col">
		<PageHeader hide-back small elevated :transparent="false" class="mb-4">{{ $t('Statistics.title') }}</PageHeader>
		<div class="content flex-1 pb-3">
			<div
				class="empty-content bg-white text-center mx-6 px-2 py-4 rounded-md shadow-md relative leading-loose mt-[8vh]"
				v-if="isLoading || statsStore.noPuzzlesSolved"
			>
				<div v-if="isLoading">{{ $t('Statistics.loading-statistics') }}</div>
				<div v-else-if="statsStore.noPuzzlesSolved">
					<div>{{ $t('Statistics.none-solved-warning') }}</div>
				</div>
			</div>
			<StatisticsContent v-else-if="!statsStore.noPuzzlesSolved" />
			<div v-else>{{ $t('Statistics.fallback-error-msg') }}</div>
		</div>
		<div class="pt-6">
			<StatsDbUtils
				@update-stats="updateStats"
				:num-solved="statsStore.puzzlesSolved"
			/>
		</div>
			
	</div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useStatisticsStore } from '@/stores/statistics';
import { storeToRefs } from 'pinia';

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