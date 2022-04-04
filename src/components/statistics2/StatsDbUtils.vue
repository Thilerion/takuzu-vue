<template>
	<div class="flex justify-center items-center gap-2">
		<button
			class="text-btn"	
			@click="exportStats"
			:disabled="!numSolved || isBusy"
		>Export data</button>
		<button
			class="text-btn"
			@click="importStats"
			:disabled="isBusy"
		>Import stats</button>
		<input
			type="file"
			ref="fileInput"
			class="absolute"
			@change="processStatsFile"
			accept=".json"
			hidden>
		<button
			class="text-btn danger"
			@click="resetStats"
			:disabled="!numSolved || isBusy"
		>Reset stats</button>
	</div>
</template>

<script setup>
import { formatYYYYMMDD } from '@/utils/date.utils.js';
import { computed, ref, toRef } from 'vue';
import { importPeek, exportPuzzleHistoryDb, cleanImportPuzzleHistoryDb } from '@/services/stats2/db/import-export.js';
import * as StatsDB from '@/services/stats2/db/index.js';

const props = defineProps({
	numSolved: {
		type: Number,
		required: true
	}
})
const numSolved = toRef(props, 'numSolved');
const emit = defineEmits(['update-stats']);

const updateNumSolved = async () => {
	emit('update-stats');
}

const isExporting = ref(false);
const isImporting = ref(false);
const isBusy = computed(() => isExporting.value || isImporting.value);

const downloadBlobAsFile = (blob, baseName = 'puzzle-history') => {
	const dateStr = formatYYYYMMDD(Date.now()).replaceAll('-', '');
	const count = numSolved.value;
	const verno = StatsDB.db.verno;
	const filename = `${baseName}-${dateStr}-solved_${count}-v${verno}.json`;
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');

	a.href = url;
	a.download = filename;
	a.click();
}

const exportStats = async () => {
	isExporting.value = true;
	
	try {
		const blob = await exportPuzzleHistoryDb(StatsDB.db);
		downloadBlobAsFile(blob);
	} catch(e) {
		console.error(e);
	} finally {
		// delay to prevent accidental redownloads
		setTimeout(() => {
			isExporting.value = false;
		}, 1000);
	}
}

const fileInput = ref(null);
const processStatsFile = async (ev) => {
	try {
		isImporting.value = true;
		const file = ev.target.files[0];
		await importPeek(file);
		await importIntoDatabase(file);
	} catch(e) {
		window.alert(`An error occurred importing stats...\n${e.message}`);
		console.warn(e);
	} finally {
		isImporting.value = false;
		ev.target.value = '';
	}
}

const confirmBeforeCleanImport = () => {
	// TODO: use modal
	const confirm1 = window.confirm('Importing this file will delete all your current progress. Are you sure you want to continue? This can NOT be undone.');
	if (!confirm1) return false;
	const confirm2 = window.confirm('Last warning. All previous progress will be deleted. Are you really sure?');
	return !!confirm2;
}

const importIntoDatabase = async (blob) => {
	if (numSolved.value > 0 && !confirmBeforeCleanImport()) return;
	
	try {
		const result = await cleanImportPuzzleHistoryDb(StatsDB.db, blob);
		console.log({ importResult: result });
		console.log('successful import!');
		// TODO: better message (modal?) that shows umport was successful
		window.alert('Succesfully imported stats!');
	} catch(e) {
		window.alert(`An error occurred importing stats...\n${e.message}`);
	} finally {
		// TODO: update stats?
		updateNumSolved();
	}
}

const importStats = async () => {
	fileInput.value.click();
}

const resetStats = async () => {
	// TODO: use modal
	const confirm1 = window.confirm('Are you sure you want to delete all your statistics, including game history and other progress? This can NOT be undone.');
	if (!confirm1) return;
	const confirm2 = window.confirm('Are you really sure??!');
	if (!confirm2) return;

	try {
		await StatsDB.clearTable();
		window.alert('Puzzle statistics and puzzle history have succesfully been reset.');
	} catch(e) {
		const str = `[ERROR]: Puzzle statistics and history could not be reset due to error, or something else went wrong: ${e.message}`;
		window.alert(str);
	} finally {
		// TODO: update stats?
		updateNumSolved();
	}
}
</script>

<style scoped>

</style>