<template>
	<div class="flex flex-col">
		<PageHeader hide-back>Statistics</PageHeader>
		<div class="content flex-1">
			<div v-if="isLoading">Loading statistics...</div>
			<div v-else-if="!numSolved">You haven't solved any puzzles yet! Go play some!</div>
			<div v-else>Woohoo!</div>
		</div>
		<StatsDbUtils
			@update-stats="updateStats"
			:num-solved="numSolved"
		/>
	</div>
</template>

<script setup>
import { getPuzzlesSolved } from '@/services/stats/data-handling.js';
import { onBeforeMount, ref } from 'vue';
import PageHeader from '../components/global/base-layout/PageHeader.vue';
import StatsDbUtils from '../components/statistics2/StatsDbUtils.vue';

const numSolved = ref(0);
const isLoading = ref(true);

onBeforeMount(async () => {
	numSolved.value = await getPuzzlesSolved();
	isLoading.value = false;
})

const updateStats = async () => {
	numSolved.value = await getPuzzlesSolved();
}

</script>

<style scoped>

</style>