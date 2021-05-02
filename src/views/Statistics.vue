<template>
	<div class="flex flex-col">
		<PageHeader hide-back>Statistics</PageHeader>
		<section>
			<h2 class="text-lg font-medium">Overall</h2>
			<span>Puzzles solved:</span>
			<span>{{puzzlesSolved}}</span>
			<span>Average time per puzzle:</span>
			<span>{{msToMinSec(averageTime)}}</span>
		</section>
		<section class="stats-btns">
			<button class="download-btn" @click="downloadStats">Download stats</button>
			<button class="reset-btn" @click="confirmReset">Reset stats</button>
		</section>
	</div>
</template>

<script>
import { statsQueries } from '@/services/stats';
import { puzzleHistoryDb, default as db } from '@/services/stats/db';
import { exportDB } from "dexie-export-import";

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
		confirmReset() {
			const result = window.confirm('Are you sure you want to delete all your statistics, including game history and other progress? This can NOT be undone.');
			if (!result) return;
			window.alert('TODO: woops, not yet implemented reset...');
		},
		async downloadStats() {
			const blob = await exportDB(db);
			const text = await blob.text();
			const json = JSON.parse(text);
			const dateStr = new Date().toLocaleDateString('en-GB');

			const key = `db-backup-${dateStr}`;

			localStorage.setItem(key, JSON.stringify(json));
			window.alert('Data backed up to localStorage.');
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

.stats-btns {
	margin-top: auto;
}

.stats-btns > button {
	@apply p-2 font-bold text-sm opacity-60;
}

.reset-btn {
	@apply text-red-600;
}
</style>