<template>
<div>
	<section class="section-block mb-8 grid grid-cols-2 gap-4">
		<StatsSummaryCard color='orange' title="Puzzles solved" :value="totalPlayed" />
		<StatsSummaryCard color='green' title="Favorite puzzle" :value="favorites.puzzle" />
		<StatsSummaryCard color='blue' title="Favorite size" :value="favorites.size" />
		<StatsSummaryCard color='rose' title="Favorite difficulty" :value="favorites.difficulty" />
	</section>
	<section class="section-block mb-8">
		<!-- <h2 class="text-lg font-medium pb-2">Overall</h2> -->
		<div class="stats-group stats-card">
			<div class="stats-line">
				<span class="label">Puzzles solved:</span>
				<span class="value-1">{{totalPlayed}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Average time:</span>
				<span class="value-1">{{msToMinSec(totalTime / totalPlayed)}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Current daily streak:</span>
				<span class="value-1">{{currentStreak}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Longest daily streak:</span>
				<span class="value-1">{{longestStreak}}</span>
			</div>
		</div>
	</section>
	<StatsCharts
		:difficulty-counts="difficultyCounts"
		:daily-stats="dailyStats"
		:board-type-counts="boardTypeCounts"
	/>
	<CalendarHeatmap
		:items="allItems"
		v-if="allItems.length"
		class="section-block mb-8"
	/>
	<section class="section-block mb-8">
		<h2 class="text-lg font-medium pb-2">Most played</h2>
		<div class="stats-group stats-card">
			<div class="stats-line">
				<span class="label">Most played size:</span>
				<span class="value-1">{{mostPlayedSize.key}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Most played difficulty:</span>
				<span class="value-1">{{mostPlayedDifficulty.key}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Most played combination:</span>
				<span class="value-1">{{mostPlayedSizePlusDifficulty.size}} @ {{mostPlayedSizePlusDifficulty.difficulty}}*</span>
			</div>
		</div>
	</section>
	<section class="section-block mb-8">
		<h2 class="text-lg font-medium">Favorites</h2>
		<div class="pl-2 pb-3 text-xs leading-snug tracking-wide opacity-80">Based on number of puzzles played, combined with total time and expected time for a puzzle size</div>
		<div class="stats-group stats-card">
			<div class="stats-line">
				<span class="label">Favorite size:</span>
				<span class="value-1">{{favoriteSize[0].key}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Favorite difficulty:</span>
				<span class="value-1">{{favoriteDifficulty.key}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Favorite combination:</span>
				<span class="value-1">{{favoriteSizePlusDifficulty[0].size}} @ {{favoriteSizePlusDifficulty[0].difficulty}}*</span>
			</div>
		</div>
	</section>
	<section class="section-block mb-8 text-sm">
		<h2 class="text-lg font-medium pb-2">By size</h2>
		<div class="stats-header flex flex-row font-medium bg-blue-800 text-white text-right pr-1">
			<div class="w-1/5">Size</div>
			<div class="w-1/4">Solved</div>
			<div class="w-1/4">Avg</div>
			<div class="w-1/4">Best</div>
		</div>
		<div
			v-for="size in bySize"
			:key="size.key"
			class="flex flex-row stat-row"
		>
			<div class="w-1/5 text-right">{{size.key}}</div>
			<div class="w-1/4 text-right">{{size.played}}</div>
			<div class="w-1/4 text-right">{{size.average}}</div>
			<div class="w-1/4 text-right">{{size.best}}</div>
		</div>
	</section>
	<section class="section-block mb-8 text-sm">
		<h2 class="text-lg font-medium pb-2">By difficulty</h2>
		<div class="stats-header flex flex-row font-medium bg-blue-800 text-white text-right pr-1">
			<div class="w-1/4">Difficulty</div>
			<div class="w-1/3">Solved</div>
			<div class="w-1/3">Rel. avg</div>
		</div>
		<div
			v-for="diff in byDifficulty"
			:key="diff.key"
			class="flex flex-row stat-row"
		>
			<div class="w-1/4 text-right">{{diff.key}}</div>
			<div class="w-1/3 text-right">{{diff.played}}</div>
			<div class="w-1/3 text-right">{{diff.average}}</div>
		</div>
	</section>
	<section class="section-block mb-8 text-sm">
		<h2 class="text-lg font-medium pb-2">Combined</h2>
		<div class="stats-header flex flex-row font-medium bg-blue-800 text-white text-right pr-1">
			<div class="w-2/12 text-left pl-1">Size</div>
			<div class="w-2/12">Diff</div>
			<div class="w-3/12">Solved</div>
			<div class="w-3/12">Average</div>
			<div class="w-3/12">Best</div>
		</div>
		<div
			v-for="item in bySizeAndDifficulty"
			:key="item.key"
			class="flex flex-row stat-row"
		>
			<div class="w-2/12 text-left pl-1">{{item.size}}</div>
			<div class="w-2/12 text-right">{{item.difficulty}}</div>
			<div class="w-3/12 text-right">{{item.played}}</div>
			<div class="w-3/12 text-right">{{item.average}}</div>
			<div class="w-3/12 text-right">{{item.best}}</div>
		</div>
	</section>
</div>
</template>

<script>
import { dimensionsToBoardType } from '@/utils/puzzle.utils.js';
import { boardTypes, DIFFICULTY_LABELS } from '@/config';
import { timeFormatter } from '@/utils/date.utils';
import CalendarHeatmap from './CalendarHeatmap.vue';
import StatsCharts from './StatsCharts.vue';
import StatsSummaryCard from './StatsSummaryCard.vue';

/* required data and how to get it:
	- puzzles by difficulty (list of items with difficulty)
	- puzzles by puzzle type (items require a puzzle type, generated from puzzle dimensions)
	
	- daily streak: generated from daily overview, streak is longest sequence of days with puzzles solved > 0

	Puzzles in groups:
	- difficulty
	- size
	- boardType, related to size
	- size+difficulty
	- day

	Each item in these groups requires: difficulty, boardType, date/day, size (wxh), etc
*/

export default {
	components: { 
		CalendarHeatmap,
		StatsCharts,
		StatsSummaryCard
	},
	props: {
		totalPlayed: Number,
		totalTime: Number,
		results: Object,
		currentStreak: Number,
		longestStreak: Number,
		dailyStats: Array,
		allItems: {
			type: Array,
			default: () => ([])
		}
	},
	data() {
		return {
			showCharts: false,
		}
	},
	computed: {
		averageTotal() {
			return this.totalTime / this.totalPlayed;
		},
		favorites() {
			return {
				puzzle: this.favoriteSizePlusDifficulty[0].size + ' @ ' + this.favoriteSizePlusDifficulty[0].difficulty + '*',
				size: this.favoriteSize[0].key,
				difficulty: this.favoriteDifficulty.key
			}
		},
		difficultyCounts() {
			const numDiff = Object.values(DIFFICULTY_LABELS).length;
			let result = [];
			for (let i = 0; i < numDiff; i++) {
				const inObj = this.results.difficulty[i];
				if (!inObj) result.push(0);
				else result.push(inObj.played);
			}
			return result;
		},
		boardTypeCounts() {
			const result = {};
			for (const value of this.bySize) {
				const { played, type } = value;
				if (result[type] == null) result[type] = 0;
				result[type] += played;
			}
			return result;
		},
		bySize() {
			if (!this.results.size.length) {
				return [];
			}
			const typeOrder = [boardTypes.NORMAL, boardTypes.RECT, boardTypes.ODD];
			return this.results.size.map(item => {
				const avg = this.msToMinSec(item.average);
				const best = this.msToMinSec(item.best);
				const key = item.key;
				const [width, height] = key.split('x').map(Number);
				const boardType = dimensionsToBoardType(width, height);
				return {...item, average: avg, best, width, height, type: boardType};
			}).sort((a, b) => {
				if (a.type !== b.type) {
					return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
				}
				return (a.width * a.height) - (b.width * b.height);
			});
		},
		byDifficulty() {
			if (!this.results.difficulty.length) return [];
			return this.results.difficulty.map(item => {
				// TODO: must be average adjusted by size...
				const average = 'TODO';
				return {...item, average};
			}).sort((a, b) => a.key - b.key);
		},
		bySizeAndDifficulty() {
			if (!this.results.sizeAndDifficulty.length) {
				return [];
			}
			const typeOrder = [boardTypes.NORMAL, boardTypes.RECT, boardTypes.ODD];
			return this.results.sizeAndDifficulty.map(item => {
				const [size, difficulty] = item.key.split('-');
				const average = this.msToMinSec(item.average);
				const best = this.msToMinSec(item.best);
				const [width, height] = size.split('x').map(Number);
				const numCells = width * height;
				return {...item, size, difficulty, average, best, numCells};
			}).sort((a, b) => {
				if (a.type !== b.type) {
					return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
				}
				if (a.numCells !== b.numCells) {
					return a.numCells - b.numCells;
				}
				return a.difficulty - b.difficulty;
			})
		},

		mostPlayedSize() {
			return this.bySize.reduce((maxSizeData, sizeData) => {
				if (sizeData.played > maxSizeData.played) return sizeData;
				return maxSizeData;
			}, { played: -1});
		},
		mostPlayedDifficulty() {
			return this.byDifficulty.reduce((bestData, diffData) => {
				if (diffData.played > bestData.played) return diffData;
				return bestData;
			}, { played: -1});
		},
		mostPlayedSizePlusDifficulty() {
			return this.bySizeAndDifficulty.reduce((bestData, diffData) => {
				if (diffData.played > bestData.played) return diffData;
				return bestData;
			}, { played: -1});
		},

		// TODO: turn favorites into moving averages? over last 30 days or something?

		// favorite stats (should) take into account:
		// - amount played
		// - total time played
		// - expected time for a certain board size, which is used as a modifier for the score in some way
		favoriteSize() {
			const getRelativeModifier = cellCount => 0.75 * Math.sqrt(cellCount / 100) + 0.25;

			const withScores = this.bySize.map(sizeStats => {
				const {width, height} = sizeStats;
				const cellCount = width * height;
				const relMod = getRelativeModifier(cellCount);
				const score = sizeStats.totalTime / relMod;
				return {...sizeStats, score };
			})
			const sorted = withScores.sort((a, b) => b.score - a.score);
			return sorted;
		},
		favoriteDifficulty() {
			return this.byDifficulty.reduce((bestData, diffData) => {
				if (diffData.totalTime > bestData.totalTime) return diffData;
				return bestData;
			}, { totalTime: 0});
		},
		favoriteSizePlusDifficulty() {
			// TODO: weigh cellCount/timeSpent score separately from amount played
			const getRelativeModifier = cellCount => 1.2 * Math.sqrt(cellCount / 100) - 0.2;

			const withScores = this.bySizeAndDifficulty.map(sizeStats => {
				const { numCells, played } = sizeStats;
				const relMod = getRelativeModifier(numCells);
				// const score = totalTime / relMod;
				const score = played * relMod;
				return {...sizeStats, score };
			})
			const sorted = withScores.sort((a, b) => b.score - a.score);
			return sorted;
		}
	},
	methods: {
		msToMinSec: timeFormatter({ padMinutes: false }),
	}
};
</script>

<style lang="postcss" scoped>
section {
	@apply text-gray-900 dark:text-white text-left;
}
.section-block {
	grid-template-columns: 2;
	@apply px-4;
}
section::v-deep(h2) {
	@apply text-opacity-60 pl-2;
}

.stats-card {
	@apply bg-white rounded overflow-hidden;
	box-shadow: 0 3px 8px rgba(154,160,185,.05), 0 8px 25px rgba(166,173,201,.2);
}

.stats-group {
	@apply text-sm;
}
.stats-line {
	@apply flex leading-none px-2 py-3;
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

.stats-header > *:first-child {
	@apply text-left;
}
.stats-header {
	@apply py-2;
}
.stats-header > * {
	@apply px-1;
}
</style>