<template>
<div>
	<section class="section-block mb-4">
		<h2 class="text-lg font-medium pb-2">Overall</h2>
		<div class="stats-group">
			<div class="stats-line">
				<span class="label">Puzzles solved:</span>
				<span class="value-1">{{totalPlayed}}</span>
			</div>
			<div class="stats-line">
				<span class="label">Average time:</span>
				<span class="value-1">{{msToMinSec(totalTime / totalPlayed)}}</span>
			</div>
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
	<section class="section-block mb-4 text-sm">
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
	<section class="section-block mb-4 text-sm">
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
	<section class="section-block mb-4 text-sm">
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
import { dimensionsToBoardType } from '@/utils';
import { boardTypes } from '@/config';
export default {
	props: {
		totalPlayed: Number,
		totalTime: Number,
		results: Object
	},
	computed: {
		averageTotal() {
			return this.totalTime / this.totalPlayed;
		},
		bySize() {
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
			return this.results.difficulty.map(item => {
				// TODO: must be average adjusted by size...
				const average = 'TODO';
				return {...item, average};
			}).sort((a, b) => a.key - b.key);
		},
		bySizeAndDifficulty() {
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
	},
	methods: {
		msToMinSec(ms = 0) {
			const format = val => `0${Math.floor(val)}`.slice(-2);

			const fullSeconds = Math.floor(ms / 1000);

			const minutes = fullSeconds / 60;
			const seconds = fullSeconds % 60;
			return `${Math.floor(minutes)}:${format(seconds)}`;
		},
	},
	mounted() {
		console.log({
			bySize: this.bySize,
			byDifficulty: this.byDifficulty,
			bySizeAndDifficulty: this.bySizeAndDifficulty,
		})
	}
};
</script>

<style lang="postcss" scoped>
section {
	@apply text-gray-900 dark:text-white text-left;
}
.section-block {
	grid-template-columns: 2;
	@apply px-8;
}
section > h2 {
	grid-column: 1 / span 2;
	@apply text-opacity-60;
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
.stats-line:nth-child(odd) {
	@apply bg-gray-200 bg-opacity-50;
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