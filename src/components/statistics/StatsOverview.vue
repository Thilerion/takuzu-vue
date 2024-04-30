<template>
<div class="grid grid-cols-2 gap-3 px-4 cards-grid">
	<StatsOverviewCard
		:value="totalPlayed"
	>
		<template #title>Puzzles solved</template>
		<template #footer>{{ totalPlayedTodayStr }} solved today</template>
	</StatsOverviewCard>

	<StatsOverviewCard
		:value="timePlayedFormatted"
	>
		<template #title>Time played</template>
		<template #footer>{{ averageTimePerDayFormatted }} average per day</template>
	</StatsOverviewCard>

	<StatsOverviewCard
		title="Days played"
		:value="datesPlayed"
		description="Days with 1+ puzzles solved"
	>
		<template #title>Days played</template>
	</StatsOverviewCard>

	<StatsOverviewCard
		:value="abbrCellsFilled"
	>
		<template #title>Cells filled</template>
	</StatsOverviewCard>
</div>
</template>

<script setup lang="ts">
import { useStatisticsStore } from '@/stores/statistics';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const statsStore = useStatisticsStore();
const { 
	puzzlesSolved: totalPlayed,
	uniqueDatesPlayed: uniqueDates,
	timePlayed,
	cellsFilled
} = storeToRefs(statsStore);

const totalPlayedToday = computed(() => {
	return statsStore.itemsSolvedToday.length;
})
const totalPlayedTodayStr = computed(() => {
	if (totalPlayedToday.value > 1 || totalPlayedToday.value === 0) {
		return `${totalPlayedToday.value} puzzles`
	}
	return `${totalPlayedToday.value} puzzle`
})
const intlFormat = (num: number) => {
	return new Intl.NumberFormat().format(Math.floor(num * 10)/10);
}
const abbrCellsFilled = computed(() => {
	const value = cellsFilled.value;
	if (value < 10000) {
		return value;
	} else if (value < 1000000) {
		return intlFormat(value / 1000) + 'k';
	} else return intlFormat(value / 1000000) + 'M';
})

const datesPlayed = computed(() => uniqueDates.value?.length ?? 0);

const formatDurationAbbr = (time: number) => {
	const second = 1000;
	const minute = second * 60;
	const hour = minute * 60;
	const day = hour * 24;

	if (time < minute) {
		const seconds = Math.floor(time / second);
		return `${seconds}s`;
	}
	if (time < hour) {
		const minutes = Math.floor(time / minute);
		const seconds = Math.floor((time - (minutes * minute)) / second);
		return `${minutes}m ${seconds}s`;
	}
	if (time < hour * 300) {
		let rem = time;
		const hours = Math.floor(rem / hour);
		rem -= (hours * hour);

		const minutes = Math.floor(rem / minute);
		return `${hours}h ${minutes}m`;
	}
	
	let rem = time;

	const days = Math.floor(rem / day);
	rem -= (days * day);

	const hours = Math.floor(rem / hour);

	return `${days}d ${hours}h`
}

const timePlayedFormatted = computed(() => {
	const time = timePlayed.value;
	return formatDurationAbbr(time);
});

const averageTimePerDayFormatted = computed(() => {
	return formatDurationAbbr(
		timePlayed.value / datesPlayed.value
	)
})
</script>

<style scoped>
.cards-grid {
	grid-template-rows: repeat(2, minmax(5.5rem, auto));
}
</style>