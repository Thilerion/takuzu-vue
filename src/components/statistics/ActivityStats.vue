<template>
	<div class="flex flex-col bg-white pt-6 rounded shadow-md overflow-hidden">
		<CalendarHeatmap
			:daily-items="dailyItems"
			v-if="dailyItems.length"
			class="self-center"
		/>
		<div class="stats-group border-t mt-4">
			<div class="stats-line gap-y-1">
				<span class="label">Current daily streak:</span>
				<span class="value-1"><span>{{currentStreak.length}}</span><span class="font-bold text-red-600" v-if="currentStreak.length && !currentStreak.active"> (!)</span></span>
				<div v-if="currentStreak.length && !currentStreak.active" class="w-full text-xs opacity-70">Play a puzzle today to continue your streak!</div>
			</div>
			<div class="stats-line">
				<span class="label">Longest daily streak:</span>
				<span class="value-1">{{longestStreak.length}}</span>
			</div>
		</div>
	</div>
</template>

<script>
import CalendarHeatmap from './CalendarHeatmap.vue';

export default {
	components: {
		CalendarHeatmap,
	},
	props: {
		dailyItems: {
			type: Array,
			default: () => ([])
		},
		currentStreak: Object,
		longestStreak: Object
	}
};
</script>

<style lang="postcss" scoped>
.stats-group {
	@apply text-sm;
}
.stats-line {
	@apply flex flex-wrap leading-none px-2 py-3;
}
.stats-line .label {
	@apply w-8/12 font-medium;
}
.stats-line .value-1 {
	@apply w-3/12 text-left;
}
.stats-line:nth-child(even) {
	@apply bg-gray-200 bg-opacity-10 border-t border-b;
}

.stat-row {
	@apply odd:bg-gray-200 odd:bg-opacity-70 py-2 text-xs;
}

.stat-row > div:first-child {
	@apply font-medium text-left;
}
.stat-row > div {
	@apply px-1;
}

</style>