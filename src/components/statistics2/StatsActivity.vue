<template>
	<div class="activity px-4">
		<h2 class="text-gray-600 text-lg font-medium px-1 pt-2 pb-1">Play activity</h2>
		<div class="bg-white rounded shadow-lg shadow-gray-600/10 divide-y pt-1" v-if="streaks != null">
			<StatsHeatmap/>
			<div class="streaks flex flex-row h-fit w-full max-w-md mx-auto divide-x">
				<CurrentStreak
					v-bind="streaks.current"
					class="streak-container"
				></CurrentStreak>
				<LongestStreak
					v-bind="streaks.longest"
					class="streak-container"
				></LongestStreak>
			</div>
		</div>
	</div>
</template>

<script setup>
import { getUniqueDatesFromItems } from '@/services/stats2/dates.js';
import { processDateStreaks } from '@/services/stats2/streaks.js';
import { computed, inject } from 'vue';
import StatsHeatmap from './StatsHeatmap.vue';
import CurrentStreak from './streaks/CurrentStreak.vue';
import LongestStreak from './streaks/LongestStreak.vue';

const items = inject('historyItems', () => [], true);

const streaks = computed(() => {
	if (!items.value?.length) return null;
	const uniqueDates = getUniqueDatesFromItems(items.value);
	const streaks = processDateStreaks(uniqueDates.map(d => d.date))

	return streaks;
})

</script>

<style scoped>
.streak {
	@apply flex flex-col justify-center items-center flex-1 px-2 pt-3 pb-4 gap-2;
}

.streak-container {
	@apply flex-1 flex flex-col items-center gap-4 pt-4 pb-2;
}

.streak-container :deep(h2) {
	@apply text-sm tracking-wider whitespace-nowrap text-ellipsis font-medium text-gray-600 h-min;
}

.streak-container :deep(.streak-length) {
	@apply aspect-square w-16 rounded-full text-white flex items-center justify-center;
}

.streak-container :deep(.text) {
	@apply w-full text-xs text-gray-700 text-center px-3 tracking-wider leading-relaxed pt-1 my-auto;
}
</style>