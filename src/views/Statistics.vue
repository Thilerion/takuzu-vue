<template>
	<div class="flex flex-col">
		<PageHeader hide-back>Statistics</PageHeader>
		<AdvancedStats
			v-if="showStats"
			:key="lastStatChange"
		/>
		<div class="py-4 px-8 text-center" v-else-if="!showStats && statsDataLoaded">
			You haven't solved any puzzles yet! Go play some!
		</div>
		<div class="p-4 text-lg text-center" v-else>Loading...</div>

		<section class="stats-btns">
			<button :disabled="exportInProgress || !puzzlesSolved" class="download-btn" @click="exportStats">Export data</button>
			<button class="import-btn" @click="startStatsImport">Import stats</button>
			<button class="reset-btn" @click="confirmReset">Reset stats</button>
			<input type="file" hidden id="file-upload" ref="fileUpload" @change="handleStatsImport">
		</section>
	</div>
</template>

<script>
import AdvancedStats from '@/components/statistics/AdvancedStats.vue';
import { importPeek, exportPuzzleHistoryDb, cleanImportPuzzleHistoryDb } from '@/services/stats2/db/import-export.js';
import * as StatsDB from '@/services/stats2/db/index.js';
import { useStatisticsStore2 } from '@/stores/statistics2.js';
import { storeToRefs } from 'pinia';

export default {
	components: { AdvancedStats },
	setup() {
		const statsStore = useStatisticsStore2();

		const {
			puzzlesSolved,
			finishedLoading,
			showData
		} = storeToRefs(statsStore);

		const reset = () => statsStore.reset();
		const initialize = () => statsStore.initialize();

		return {
			puzzlesSolved,
			statsDataLoaded: finishedLoading,
			showStats: showData,

			reset,
			initialize
		}
	},
	data() {
		return {
			exportInProgress: false,
			lastStatChange: Date.now(),
		}
	},
	methods: {
		confirmReset() {
			setTimeout(() => {
				// TODO: use modal
				const result = window.confirm('Are you sure you want to delete all your statistics, including game history and other progress? This can NOT be undone.');
				if (!result) return;
				const result2 = window.confirm('Are you REALLY SURE???');
				if (!result2) return;
				
				StatsDB.clearTable('puzzleHistory').then(() => {
					window.alert('Puzzle statistics and puzzle history have succesfully been reset.');
					this.updateStats();
				}).catch(e => {
					const str = `[ERROR]: Puzzle statistics and history could not be reset due to error: ${e.toString()}`;
					window.alert(str);
				})
				
			}, 150);			
		},
		async exportStats() {
			try {
				this.exportInProgress = true;
				const blob = await exportPuzzleHistoryDb(StatsDB.db);
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
		downloadBlob(blob, baseName = 'puzzle-history') {
			const dateStr = new Date().toLocaleDateString();
			const count = this.puzzlesSolved ?? 0;
			const filename = `${baseName}-${count}-${dateStr}.json`;
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = filename;
			a.click();
		},
		startStatsImport() {
			this.$refs.fileUpload.click();
		},
		async handleStatsImport(ev) {
			try {
				const file = ev.target.files[0];
				await importPeek(file);
				await this.importStatsIntoDb(file);
			} catch(e) {
				window.alert('An error occurred importing stats...');
				console.warn(e);
			}
		},
		async importStatsIntoDb(blob) {
			try {
				await cleanImportPuzzleHistoryDb(StatsDB.db, blob);
				console.log('successful import!');
				// TODO: better message (modal?) that shows umport was successful
				window.alert('Succesfully imported stats!');
			} catch(e) {
				window.alert('Error encountered while importing stats... Sorry!');
			} finally {
				this.updateStats();
			}
		},
		updateStats(withReset = true) {
			if (withReset) {
				this.reset();
			}

			this.initialize();
		}
	},
	beforeMount() {
		this.updateStats(false);

	},
	watch: {
		puzzlesSolved(newValue, oldValue) {
			console.log({newValue, oldValue});
			this.lastStatChange = Date.now();
		}
	}
};
</script>

<style scoped>
section {
	@apply text-gray-900 dark:text-white text-left;
}
.section-block {
	grid-template-columns: 2;
	@apply px-8;
}
section > h2 {
	grid-column: 1 / span 2;
}

.stats-btns {
	@apply mt-auto flex mx-auto space-x-2;
}

.stats-btns > button {
	@apply px-3 py-2 font-bold text-xs opacity-60 tracking-wide focus:outline-none active:ring active:ring-teal-600 active:ring-opacity-70 rounded;

	@apply hover-hover:hover:opacity-90 active:opacity-90;
	@apply disabled:opacity-30;
}

.reset-btn {
	@apply text-red-700 active:ring-red-600;
}
</style>