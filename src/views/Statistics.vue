<template>
	<div>
		<PageHeader hide-back>Statistics</PageHeader>
		<section>
			<h2 class="text-lg font-medium">Overall</h2>
			<span>Puzzles solved:</span>
			<span>{{puzzlesSolved}}</span>
		</section>
	</div>
</template>

<script>
import { statsQueries } from '@/services/stats';
export default {
	data() {
		return {
			puzzlesSolved: null
		}
	},
	methods: {
		getPuzzlesSolved() {
			return statsQueries.numSolved();
		},
		async getInitialData() {
			this.puzzlesSolved = await this.getPuzzlesSolved();
		}
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