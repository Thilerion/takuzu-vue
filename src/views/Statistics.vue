<template>
	<div>
		<PageHeader hide-back>Statistics</PageHeader>
		<section>
			<h2 class="text-lg font-medium">Overall</h2>
			<span>Puzzles solved:</span>
			<span>{{puzzlesSolved}}</span>
			<span>Average time per puzzle:</span>
			<span>{{msToMinSec(averageTime)}}</span>
		</section>
	</div>
</template>

<script>
import { statsQueries } from '@/services/stats';
import { puzzleHistoryDb } from '@/services/stats/db';
export default {
	data() {
		return {
			puzzlesSolved: null,
			averageTime: null,
		}
	},
	methods: {
		getPuzzlesSolved() {
			return statsQueries.numSolved();
		},
		async getAverageTime() {
			let num = 0;
			let time = 0;
			await puzzleHistoryDb
				.orderBy('timeElapsed')
				.eachKey((timeElapsed) => {
					num += 1;
					time += (timeElapsed * 1);
				});
			console.log({num, time});
			return time / num;			
		},
		async getInitialData() {
			this.puzzlesSolved = await this.getPuzzlesSolved();
			this.averageTime = await this.getAverageTime();
		},
		msToMinSec(ms) {
			const format = val => `0${Math.floor(val)}`.slice(-2);

			const fullSeconds = Math.floor(ms / 1000);

			const minutes = fullSeconds / 60;
			const seconds = fullSeconds % 60;
			return `${format(minutes)}:${format(seconds)}`;
		},
	},
	beforeMount() {
		this.getInitialData();
	}
};
</script>

<style lang="postcss" scoped>
section {
	grid-template-columns: 2;
	@apply text-gray-900 dark:text-white text-left px-8 grid;
}
section > h2 {
	grid-column: 1 / span 2;
}
</style>