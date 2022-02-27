<template>
<div>
	<section class="section-block mb-8 grid grid-cols-2 gap-4">
		<StatsSummaryCard color='orange' title="Puzzles solved" :value="totalPlayed" />
		<StatsSummaryCard color='green' title="Favorite puzzle" :value="favorites.puzzle" />
		<StatsSummaryCard color='blue' title="Favorite size" :value="favorites.size" />
		<StatsSummaryCard color='rose' title="Favorite difficulty" :value="favorites.difficulty" />
	</section>
	<section class="section-block mb-8">
		<h2 class="text-lg font-medium pb-2">Play activity</h2>
		<ActivityStats
			:dailyItems="dateSummaries"
			:longest-streak="longestStreak"
			:current-streak="currentStreak"
		/>
	</section>
	<section class="section-block mb-8">
		<MostRecentPuzzles />
	</section>
	<StatsCharts
		:difficulty-counts="difficultyCounts"
		:board-type-counts="boardTypeCounts"
	/>
	<section class="section-block mb-8">
		<h2 class="text-lg font-medium pb-2">Most played</h2>
		<div class="stats-group stats-card">
			<div class="stats-line">
				<span class="label">Most played size:</span>
				<span class="value-1">{{mostPlayedSize.size}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Most played difficulty:</span>
				<span class="value-1">{{mostPlayedDifficulty.difficulty}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Most played combination:</span>
				<span class="value-1">{{mostPlayedSizePlusDifficulty.dimensions}} @ {{mostPlayedSizePlusDifficulty.difficulty}}*</span>
			</div>
		</div>
	</section>
	<section class="section-block mb-8">
		<h2 class="text-lg font-medium">Favorites</h2>
		<div class="pl-2 pb-3 text-xs leading-snug tracking-wide opacity-80">Based on number of puzzles played, combined with total time and expected time for a puzzle size</div>
		<div class="stats-group stats-card">
			<div class="stats-line">
				<span class="label">Favorite size:</span>
				<span class="value-1">{{favoriteSize}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Favorite difficulty:</span>
				<span class="value-1">{{favoriteDifficulty}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Favorite combination:</span>
				<span class="value-1">{{favoriteSizePlusDifficulty.dimensions}} @ {{favoriteSizePlusDifficulty.difficulty}}*</span>
			</div>
		</div>
	</section>
	<section class="section-block mb-8 text-sm table-block">
		<h2 class="text-lg font-medium pb-2">By size</h2>
		<div class="stats-header flex flex-row font-medium bg-blue-800 text-white text-right pr-1">
			<div class="w-1/5">Size</div>
			<div class="w-1/4">Solved</div>
			<div class="w-1/4">Avg</div>
			<div class="w-1/4">Best</div>
		</div>
		<div
			v-for="sizeSumm in sizeTableData"
			:key="sizeSumm.formatted.size"
			class="flex flex-row stat-row"
		>
			<div class="w-1/5 text-right">{{sizeSumm.formatted.size}}</div>
			<div class="w-1/4 text-right">{{sizeSumm.formatted.totalPlayed}}</div>
			<div class="w-1/4 text-right">{{sizeSumm.formatted.average}}</div>
			<div class="w-1/4 text-right">{{sizeSumm.formatted.best}}</div>
		</div>
	</section>
	<section class="section-block mb-8 text-sm table-block">
		<h2 class="text-lg font-medium pb-2">By difficulty</h2>
		<div class="stats-header flex flex-row font-medium bg-blue-800 text-white text-right pr-1">
			<div class="w-1/4">Difficulty</div>
			<div class="w-1/3">Solved</div>
			<div class="w-1/3">Rel. avg</div>
		</div>
		<div
			v-for="diff in difficultyTableData"
			:key="diff.formatted.difficulty"
			class="flex flex-row stat-row"
		>
			<div class="w-1/4 text-right">{{diff.formatted.difficulty}}</div>
			<div class="w-1/3 text-right">{{diff.formatted.totalPlayed}}</div>
			<div class="w-1/3 text-right">{{diff.formatted.adjustedAverage}}</div>
		</div>
	</section>
	<section class="section-block mb-8 text-sm table-block">
		<h2 class="text-lg font-medium pb-2">Combined</h2>
		<div class="stats-header flex flex-row font-medium bg-blue-800 text-white text-right pr-1">
			<div class="w-2/12 text-left pl-1">Size</div>
			<div class="w-2/12">Diff</div>
			<div class="w-2/12">Solved</div>
			<div class="w-2/12">Avg</div>
			<div class="w-2/12">Rel. avg</div>
			<div class="w-2/12">Best</div>
		</div>
		<div
			v-for="item in combinedTableData"
			:key="item.raw.sizeDifficultyStr"
			class="flex flex-row stat-row"
		>
			<div class="w-2/12 text-left pl-1">{{item.formatted.dimensions}}</div>
			<div class="w-2/12 text-right">{{item.formatted.difficulty}}</div>
			<div class="w-2/12 text-right">{{item.formatted.totalPlayed}}</div>
			<div class="w-2/12 text-right">{{item.formatted.average}}</div>
			<div class="w-2/12 text-right">{{item.formatted.adjustedAverage}}</div>
			<div class="w-2/12 text-right">{{item.formatted.best}}</div>
		</div>
	</section>
</div>
</template>

<script>
import { boardTypes } from '@/config.js';
import { timeFormatter } from '@/utils/date.utils.js';
import StatsCharts from './StatsCharts.vue';
import StatsSummaryCard from './StatsSummaryCard.vue';
import ActivityStats from './ActivityStats.vue';
import { mapGetters, mapState } from 'vuex';
import { differenceInCalendarDays, isToday, isYesterday } from 'date-fns';
import MostRecentPuzzles from './MostRecentPuzzles.vue';

export default {
	components: {
    StatsCharts,
    StatsSummaryCard,
    ActivityStats,
    MostRecentPuzzles
},
	inheritAttrs: false,
	data() {
		return {
		}
	},
	computed: {
		...mapState('statsData', {
			allItems: state => state.historyItems,
			totalPlayed: state => state.puzzlesSolved,
		}),
		...mapGetters('statsData', [
			'groupedBySize',
			'groupedByDifficulty',
			'groupedBySizeDifficultyCombination',
			'totalTime',
			'sizeSummaries',
			'difficultySummaries',
			'difficultySizeSummaries',
			'dateSummaries',
			'allDatesWithPuzzlesSolved',
		]),

		dateStreaks() {
			const dates = this.allDatesWithPuzzlesSolved;

			let prevDate = dates[0];
			let currentStreak = [prevDate];

			const streaks = [];

			for (let i = 1; i < dates.length; i++) {
				const curDate = dates[i];
				const diff = differenceInCalendarDays(curDate, prevDate);
				if (diff === 1) {
					currentStreak.push(curDate);
				} else if (diff > 1) {
					streaks.push(currentStreak);
					currentStreak = [curDate];
				}
				prevDate = curDate;
			}
			streaks.push(currentStreak);
			return streaks.filter(val => val.length > 0);
		},
		longestStreak() {
			if (!this.dateStreaks.length) return { length: 0 };

			const longest = this.dateStreaks.reduce((acc, val) => {
				if (val.length >= acc.length) return val;
				return acc;
			}, []);
			const length = longest.length;
			const from = longest[0];
			const to = longest[length - 1];
			return { length, from, to };
		},
		currentStreak() {
			if (!this.dateStreaks.length) return { length: 0 };
			const last = this.dateStreaks[this.dateStreaks.length - 1];
			const lastDate = last[last.length - 1];

			if (isToday(lastDate)) {
				const length = last.length;
				const from = last[0];
				const to = last[last.length - 1];
				return { length, from, to, active: true };
			} else if (isYesterday(lastDate)) {
				const length = last.length;
				const from = last[0];
				const to = last[last.length - 1];
				return { length, from, to, active: false };
			} else {
				return { length: 0 };
			}
		},
		averageTotal() {
			return this.totalTime / this.totalPlayed;
		},

		mostPlayedSize() {
			return this.sizeSummaries.reduce((max, summary) => {
				const amount = summary.totalPlayed;
				if (max == null || amount > max.totalPlayed) {
					return summary;
				} else return max;
			}, null).groupData;
		},
		favoriteSize() {
			const scores = this.sizeSummaries.map(summary => {
				const score = this.sizeSummaryToScore(summary);
				return { score, size: summary.groupData.size }
			});
			return scores.reduce((max, item) => {
				if (item.score > max.score) return item;
				return max;
			}, { score: -1 }).size;
		},

		mostPlayedDifficulty() {
			return this.difficultySummaries.reduce((max, summary) => {
				const amount = summary.totalPlayed;
				if (max == null || amount > max.totalPlayed) {
					return summary;
				} else return max;
			}, null).groupData;
		},
		favoriteDifficulty() {
			const scores = this.difficultySummaries.map(summary => {
				const score = this.difficultySummaryToScore(summary);
				return { score, difficulty: summary.groupData.difficulty};
			})
			return scores.reduce((max, item) => {
				if (item.score > max.score) return item;
				return max;
			}, { score: -1 }).difficulty;
		},

		mostPlayedSizePlusDifficulty() {
			return this.difficultySizeSummaries.reduce((max, summary) => {
				const amount = summary.totalPlayed;
				if (max == null || amount > max.totalPlayed) {
					return summary;
				} else return max;
			}, null).groupData;
		},
		favoriteSizePlusDifficulty() {
			const scores = this.difficultySizeSummaries.map(summary => {
				const score = this.sizeDifficultySummaryToScore(summary);
				return { score, groupData: summary.groupData };
			})
			return scores.reduce((max, item) => {
				if (item.score > max.score) return item;
				return max;
			}, { score: -1 }).groupData;
		},

		sizeTableData() {
			const boardTypeOrder = [boardTypes.NORMAL, boardTypes.RECT, boardTypes.ODD];
			return this.sizeSummaries.map(summ => {
				const { groupData, totalPlayed, average: averageMs, best: bestMs } = summ;
				const { boardType, numCells, size } = groupData;

				const rawData = {
					size, totalPlayed, boardType, numCells,
					average: averageMs, best: bestMs,
				};
				const formattedData = {
					size, totalPlayed,
					average: this.msToMinSec(averageMs),
					best: this.msToMinSec(bestMs)
				}

				return {
					raw: rawData,
					formatted: formattedData
				}
			}).sort((a, b) => {
				const boardTypeA = a.raw.boardType;
				const boardTypeB = b.raw.boardType;
				if (boardTypeA !== boardTypeB) {
					return boardTypeOrder.indexOf(boardTypeA) - boardTypeOrder.indexOf(boardTypeB);
				} else {
					return a.raw.numCells - b.raw.numCells;
				}
			})
		},
		difficultyTableData() {
			return this.difficultySummaries.reduce((acc, summ) => {
				if (summ.totalPlayed < 1) return acc;
				const { groupData, adjustedAverage: adjustedAverageMs, totalPlayed } = summ;
				const { difficulty } = groupData;
				const resVal = {
					raw: {
						difficulty, totalPlayed, adjustedAverage: adjustedAverageMs
					},
					formatted: {
						difficulty, totalPlayed,
						adjustedAverage: this.msToMinSec(adjustedAverageMs)
					}
				}
				acc.push(resVal);
				return acc;
			}, []).sort((a, b) => {
				return a.raw.difficulty - b.raw.difficulty;
			})
		},
		combinedTableData() {
			const mappedValues = this.difficultySizeSummaries
				.filter(val => !!val.totalPlayed)
				.map(summ => {
					const { groupData, totalPlayed, average: averageMs, best: bestMs, adjustedAverage: adjustedAverageMs} = summ;
					const { boardType, difficulty, numCells, dimensions, sizeDifficultyStr } = groupData;
					return {
						raw: {
							totalPlayed, boardType, difficulty,
							numCells, dimensions, sizeDifficultyStr,
							best: bestMs, average: averageMs, adjustedAverage: adjustedAverageMs
						},
						formatted: {
							totalPlayed, boardType, difficulty, numCells, dimensions,

							best: this.msToMinSec(bestMs),
							average: this.msToMinSec(averageMs),
							adjustedAverage: this.msToMinSec(adjustedAverageMs),
						}
					}
				});
			return mappedValues.sort((a, b) => {
				const boardTypeOrder = [boardTypes.NORMAL, boardTypes.RECT, boardTypes.ODD];
				if (a.raw.boardType !== b.raw.boardType) {
					return boardTypeOrder.indexOf(a.raw.boardType) - boardTypeOrder.indexOf(b.raw.boardType);
				}
				if (a.raw.numCells !== b.raw.numCells) {
					return a.raw.numCells - b.raw.numCells;
				}
				return a.raw.difficulty - b.raw.difficulty;
			})
		},





		favorites() {
			return {
				puzzle: this.favoriteSizePlusDifficulty.dimensions + ' @ ' + this.favoriteSizePlusDifficulty.difficulty + '*',
				size: this.favoriteSize,
				difficulty: this.favoriteDifficulty
			}
		},
		difficultyCounts() {
			const byDiff = this.$store.getters['statsData/groupedByDifficulty'];
			const num = Object.keys(byDiff).length;
			let result = Array(num).fill(0);
			for (const [diff, values] of Object.entries(byDiff)) {
				result[diff - 1] = values.length;
			}
			return result;
		},
		boardTypeCounts() {
			const byType = this.$store.getters['statsData/groupedByBoardType'];
			const result = {};
			for (const [type, values] of Object.entries(byType)) {
				result[type] = values.length;
			}
			return result;
		},

		// TODO: turn favorites into moving averages? over last 30 days or something?
	},
	methods: {
		msToMinSec: timeFormatter({ padMinutes: false }),
		sizeSummaryToScore(summary) {
			const { numCells } = summary.groupData;
			const scoreMod = 0.75 * Math.sqrt(numCells / 100) + 0.25;
			return summary.totalTime  / scoreMod;
		},
		difficultySummaryToScore(summary) {
			const { adjustedTime, totalTime } = summary;
			return adjustedTime + Math.sqrt(totalTime);
		},
		sizeDifficultySummaryToScore(summary) {
			const { numCells } = summary.groupData;
			const scoreMod = 1.2 * Math.sqrt(numCells / 100) - 0.2;
			return summary.totalPlayed * scoreMod;
		}
	},
};
</script>

<style scoped>
section {
	@apply text-gray-900 dark:text-white text-left;
}
.section-block {
	grid-template-columns: 2;
	@apply px-4;
}
.section-block.table-block {
	@apply px-0;
}
.section-block.table-block::v-deep(h2) {
	@apply px-4;
}
section::v-deep(h2) {
	@apply text-opacity-60 pl-2;
}

.stats-card {
	@apply bg-white rounded overflow-hidden;
	box-shadow: 0 3px 8px rgba(154,160,185,.05), 0 8px 25px rgba(166,173,201,.2);
}

.stats-header, .stat-row {
	@apply px-2;
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