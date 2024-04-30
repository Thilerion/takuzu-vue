<template>
<div class="activity px-4">
	<h2 class="text-gray-600 text-lg font-medium px-1 pt-2 pb-1">Play activity</h2>
	<div v-if="streaks != null" class="bg-white rounded shadow-lg shadow-gray-600/10 divide-y pt-1">
		<StatsHeatmap />
		<div class="streaks flex flex-row h-fit w-full max-w-xl mx-auto divide-x">
			<CurrentStreak
				:active="streaks.current.active"
				:from="streaks.current.from ?? undefined"
				:length="streaks.current.length"
				class="streak-container"
			/>
			<LongestStreak
				:length="streaks.longest.length"
				:from="streaks.longest.from ?? undefined"
				:to="streaks.longest.to ?? undefined"
				class="streak-container"
			/>
		</div>
		<MostRecentHistory />
	</div>
</div>
</template>

<script setup lang="ts">
import { processDateStreaks } from '@/services/stats/streaks';
import { computed, toRef } from 'vue';

import { useStatisticsStore } from '@/stores/statistics';
import CurrentStreak from './streaks/CurrentStreak.vue';
import LongestStreak from './streaks/LongestStreak.vue';

const statsStore = useStatisticsStore();
const items = toRef(statsStore, 'historyItems');
const uniqueDates = toRef(statsStore, 'uniqueDatesPlayed');

const streaks = computed(() => {
	if (!items.value?.length) return null;
	const streaks = processDateStreaks(uniqueDates.value.map(d => d.date))

	return streaks;
})

</script>

<style scoped>
.streak {
	@apply flex flex-col justify-center items-center flex-1 px-2 pt-2 pb-2 gap-2;
}

.streak-container {
	@apply flex-1 flex flex-col items-center gap-2 pt-3 pb-1;
}

.streak-container :deep(h2) {
	@apply text-sm tracking-wider whitespace-nowrap text-ellipsis font-medium text-gray-600 h-min;
}

.streak-container :deep(.streak-length) {
	@apply aspect-square w-14 rounded-full flex items-center justify-center text-2xl leading-none font-extrabold;
}

.streak-container :deep(.text) {
	@apply w-full text-xs text-gray-700 text-center px-3 tracking-wider leading-relaxed pt-1 my-auto;
}
</style>