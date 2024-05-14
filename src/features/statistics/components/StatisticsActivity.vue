<template>
<div>
	<StatisticsBlockHeading>
		Play activity
	</StatisticsBlockHeading>
	<div class="bg-white rounded shadow-lg shadow-gray-600/10 py-2">
		<StatisticsHeatMap
			:items="itemsPastYear"
		/>
	</div>
</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useStatisticsNextStore } from '../store.js';
import { computed } from 'vue';
import { startOfDay, subDays, subYears } from 'date-fns';

const statsNextStore = useStatisticsNextStore();
const { itemsRecentFirst } = storeToRefs(statsNextStore);

const itemsPastYear = computed(() => {
	const now = new Date();
	const pastYear = startOfDay(subDays(subYears(now, 1), 1));
	return itemsRecentFirst.value.filter((item) => item.date >= pastYear);
})
</script>

<style scoped>

</style>