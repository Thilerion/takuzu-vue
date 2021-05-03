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
			<button :disabled="exportInProgress" class="download-btn" @click="exportStats">Export data</button>
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

			exportInProgress: false,
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
			setTimeout(() => {
				// TODO: use modal
				const result = window.confirm('Are you sure you want to delete all your statistics, including game history and other progress? This can NOT be undone.');
				if (!result) return;

				window.alert('Just kidding, not yet implemented reset...');
			}, 150);			
		},
		async exportStats() {
			try {
				this.exportInProgress = true;
				const blob = await exportDB(db, {
					prettyJson: true,
					filter: (table) => table === 'puzzleHistory',
					progressCallback: ({totalRows, completedRows}) => {
						console.log(`Progress: ${completedRows} of ${totalRows} rows completed`)
					}
				});
				this.downloadBlob(blob);
			} catch(e) {
				console.error(e);
			} finally {
				setTimeout(() => {
					// prevent accidental redownloads
					this.exportInProgress = false;
				}, 1000);
			}
		},
		downloadBlob(blob, filename = 'puzzle-history-export') {
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = filename + '.json';
			a.click();
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
	@apply mt-auto flex mx-auto space-x-2;
}

.stats-btns > button {
	@apply px-3 py-2 font-bold text-xs opacity-50 tracking-wide focus:outline-none active:ring active:ring-teal-600 active:ring-opacity-70 rounded;

	@apply hover-hover:hover:opacity-90 active:opacity-90;
}

.reset-btn {
	@apply text-red-700 active:ring-red-600;
}
</style>