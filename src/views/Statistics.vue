<template>
	<div class="flex flex-col">
		<PageHeader hide-back>Statistics</PageHeader>
		<BaseButton v-if="!showAdvanced" @click="showAdvanced = true" class="mx-8 mb-4">Show new stats screen</BaseButton>
		<BaseButton v-else @click="showAdvanced = false" class="mx-8 mb-4">Show original stats screen</BaseButton>

		<template v-if="!showAdvanced">
			<section class="grid section-block mb-4">
				<h2 class="text-lg font-medium pb-2">Overall</h2>
				<span>Puzzles solved:</span>
				<span>{{puzzlesSolved}}</span>
				<span>Average time per puzzle:</span>
				<span>{{msToMinSec(averageTime)}}</span>
			</section>

			<section class="px-8 mb-4">
				<h2 class="text-lg font-medium pt-2 pb-2">By puzzle size</h2>
				<transition name="fade">
					<StatsTable
						v-if="byPuzzleSizeData && byPuzzleSizeData.length"
						:headers="byPuzzleSizeHeaders"
						:items="byPuzzleSizeData"
						:group="groupByPuzzleType"
						:groups="puzzleBoardTypes"
					/>
				</transition>
			</section>
		</template>

		<template v-else>
			<advanced-stats v-bind="advancedStats" v-if="advancedStats != null" />
			<div class="p-4 text-lg text-center" v-else>Loading...</div>
		</template>

		<section class="stats-btns">
			<button :disabled="exportInProgress || !puzzlesSolved" class="download-btn" @click="exportStats">Export data</button>
			<button class="import-btn" @click="startStatsImport">Import stats</button>
			<button class="reset-btn" @click="confirmReset">Reset stats</button>
			<input type="file" hidden id="file-upload" ref="fileUpload" @change="handleStatsImport">
		</section>
	</div>
</template>

<script>
import { clearPuzzleHistory, getAllStats, statsQueries } from '@/services/stats';
import { puzzleHistoryDb, default as db } from '@/services/stats/db';
import { exportDB, importInto } from "dexie-export-import";
import StatsTable from '@/components/statistics/StatsTable.vue';
import { boardTypes } from '@/config';
import { dimensionsToBoardType } from '@/utils/puzzle.utils.js';
import AdvancedStats from '@/components/statistics/AdvancedStats.vue';

export default {
	components: { StatsTable, AdvancedStats },
	data() {
		return {
			showAdvanced: true,

			puzzlesSolved: null,
			averageTime: null,
			
			byPuzzleSize: null,
			byPuzzleSizeData: null,
			byPuzzleSizeHeaders: [
				{ text: 'Size', value: 'dimensions', colHeader: true },
				{ text: 'Played', value: 'played' },
				{ text: 'Average Time', value: 'averageTime', align: 'right' },
			],
			groupByPuzzleType: true,
			puzzleBoardTypes: [
				boardTypes.NORMAL,
				boardTypes.RECT,
				boardTypes.ODD
			],

			exportInProgress: false,

			advancedStats: null,
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
			if (num < 1 || time < 1) return 0;
			return time / num;			
		},
		async getInitialData() {
			this.puzzlesSolved = await this.getPuzzlesSolved();
			this.averageTime = await this.getAverageTime();

			const bySize = await this.getStatsBySize();
			this.byPuzzleSize = bySize.raw;
			this.byPuzzleSizeData = bySize.tableData;
			
			
		},
		async getStatsBySize() {
			const total = {};
			await puzzleHistoryDb.each((item, cursor) => {
				const size = item.width + 'x' + item.height;
				const curTotal = total[size] ?? { amount: 0, elapsed: 0, numCells: item.width * item.height };
				curTotal.amount += 1;
				curTotal.elapsed += item.timeElapsed;
				total[size] = curTotal;
				total[size].width = item.width;
				total[size].height = item.height;
			}).then(res => {
				for (const key of Object.keys(total)) {
					const sizeData = total[key];
					total[key].averageTime = sizeData.elapsed / sizeData.amount;
				}
				return total;
			})
			
			const tableData = [];
			for (const puzzleDims of Object.keys(total)) {
				const origData = total[puzzleDims];

				const {width, height, numCells, averageTime, amount} = origData;
				const boardType = dimensionsToBoardType(width, height);
				const obj = {
					dimensions: puzzleDims,
					numCells,
					averageTime: this.msToMinSec(averageTime),
					played: amount,
					sizeGroup: boardType
				}
				tableData.push(obj);
			}
			tableData.sort((a, b) => {
				const numA = a.numCells;
				const numB = b.numCells;
				return numA - numB;
			})

			return {raw: total, tableData};
		},
		msToMinSec(ms = 0) {
			const format = val => `0${Math.floor(val)}`.slice(-2);

			const fullSeconds = Math.floor(ms / 1000);

			const minutes = fullSeconds / 60;
			const seconds = fullSeconds % 60;
			return `${Math.floor(minutes)}:${format(seconds)}`;
		},
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
					this.testUniqueKeys();
				}).catch(e => {
					const str = `[ERROR]: Puzzle statistics and history could not be reset due to error: ${e.toString()}`;
					window.alert(str);
				})
				
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
			await importInto(db, blob, {
				clearTablesBeforeImport: true,
				filter: (table) => table === 'puzzleHistory'
			});
			console.log('succesfull import!');
			this.getInitialData();
		},
		async testUniqueKeys() {
			const r = await getAllStats();
			console.log(r);
			this.advancedStats = r;
		}
	},
	beforeMount() {
		this.getInitialData();
		this.testUniqueKeys();
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