<template>
	<div class="flex flex-col">
		<PageHeader hide-back>Statistics</PageHeader>
		<AdvancedStats
			v-bind="advancedStats"
			v-if="advancedStats != null && showStats"
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
import { clearPuzzleHistory, getAllStats, exportPuzzleHistory, importPuzzleHistory } from '@/services/stats';
import AdvancedStats from '@/components/statistics/AdvancedStats.vue';

export default {
	components: { AdvancedStats },
	data() {
		return {
			exportInProgress: false,

			advancedStats: null,
		}
	},
	computed: {
		puzzlesSolved() {
			return this.$store.state.statsData.puzzlesSolved;
		},
		statsDataLoaded() {
			return this.$store.getters['statsData/finishedLoading'];
		},
		showStats() {
			return this.$store.getters['statsData/showData'];
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
				
				clearPuzzleHistory().then(() => {
					window.alert('Puzzle statistics and puzzle history have succesfully been reset.');
					this.getInitialData();
					this.getAdvancedStatsData();
				}).catch(e => {
					const str = `[ERROR]: Puzzle statistics and history could not be reset due to error: ${e.toString()}`;
					window.alert(str);
				})
				
			}, 150);			
		},
		async exportStats() {
			try {
				this.exportInProgress = true;
				const blob = await exportPuzzleHistory();
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
				await this.importStatsIntoDb(file);
			} catch(e) {
				window.alert('An error occurred importing stats...');
				console.warn(e);
			}
		},
		async importStatsIntoDb(blob) {
			try {
				await importPuzzleHistory(blob);
				console.log('successful import!');
				// TODO: better message (modal?) that shows umport was successful
				window.alert('Succesfully imported stats!');
			} catch(e) {
				window.alert('Error encountered while importing stats... Sorry!');
			} finally {
				this.getInitialData();
				this.getAdvancedStatsData();
			}
		},
		async getAdvancedStatsData() {
			try {
				const r = await getAllStats();
				console.log(r);
				this.advancedStats = r;
			} catch(e) {
				console.warn('Error while trying to get all (advanced) stats.');
				console.log(e);
				this.advancedStats = null;
			}
		}
	},
	beforeMount() {
		this.$store.dispatch('statsData/initialize');
		this.getAdvancedStatsData();

	},
	unmounted() {
		this.$store.dispatch('statsData/reset');
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