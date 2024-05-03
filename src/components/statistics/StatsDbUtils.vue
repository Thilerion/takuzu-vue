<template>
<div class="flex justify-center items-center gap-2">
	<button
		class="text-btn"	
		:disabled="!numSolved || isBusy"
		@click="exportStats"
	>Export data</button>
	<button
		class="text-btn"
		:disabled="isBusy"
		@click="importStats"
	>Import stats</button>
	<input
		ref="fileInput"
		type="file"
		class="absolute"
		multiple
		accept=".json"
		hidden
		@change="processStatsFile"
	>
	<button
		class="text-btn danger"
		:disabled="!numSolved || isBusy"
		@click="resetStats"
	>Reset stats</button>
</div>
</template>

<script setup lang="ts">
import { formatYYYYMMDD } from '@/utils/date.utils';
import { computed, ref, toRef } from 'vue';
import { statsDb } from '@/services/db/stats-db/init.js';
import { importPeek, exportPuzzleHistoryDb, cleanImportPuzzleHistoryDb, importPuzzleHistoryItemsWithVersionUpgrade } from '@/services/db/stats-db/stats-db-import-export.js';
import { iterateFiles } from '@/utils/file.utils.js';

const props = defineProps({
	numSolved: {
		type: Number,
		required: true
	}
})
const numSolved = toRef(props, 'numSolved');
const emit = defineEmits<{
	'update-stats': []
}>();

const updateNumSolved = async () => {
	emit('update-stats');
}

const isExporting = ref(false);
const isImporting = ref(false);
const isBusy = computed(() => isExporting.value || isImporting.value);

const downloadBlobAsFile = (blob: Blob, baseName = 'puzzle-history') => {
	const dateStr = formatYYYYMMDD(Date.now()).replaceAll('-', '');
	const count = numSolved.value;
	const verno = statsDb.verno;
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
		const blob = await exportPuzzleHistoryDb(statsDb);
		downloadBlobAsFile(blob);
	} catch(e) {
		console.error(e);
	} finally {
		// delay to prevent accidental redownloads
		window.setTimeout(() => {
			isExporting.value = false;
		}, 1000);
	}
}

const fileInput = ref<HTMLInputElement | null>(null);
const processStatsFile = async (ev: Event) => {
	const tg = ev.target as HTMLInputElement;
	console.log(tg.files);
	if (tg.files == null) {
		throw new Error('HTML File element files property is null.');
	}
	if (tg.files.length > 1) {
		return processMultipleStatsFiles(ev);
	}
	try {
		isImporting.value = true;
		const file = tg.files[0];
		const r = await importPeek(file);
		if (r.databaseVersion < statsDb.verno) {
			await importIntoDatabaseMergeAndUpgrade(file);
		} else {
			await importIntoDatabase(file);
		}
	} catch(e) {
		window.alert(`An error occurred importing stats...\n${(e as Error).message}`);
		console.warn(e);
	} finally {
		isImporting.value = false;
		tg.value = '';
	}
}

function* eachFileInFilelist(list: FileList): Generator<File> {
	yield* iterateFiles(list);
}

const processMultipleStatsFiles = async (ev: Event) => {
	const tg = ev.target as HTMLInputElement;
	try {
		const files: FileList = tg.files as FileList;
		if (!files.length) {
			throw new Error('FileList is empty.');
		}
		isImporting.value = true;
		for (const file of eachFileInFilelist(files)) {
			await processSingleStatFile(file);
		}
	} catch(e) {
		window.alert(`An error occurred importing stats...\n${(e as Error).message}`);
		console.warn(e);
	} finally {
		isImporting.value = false;
		tg.value = '';
	}
}

const processSingleStatFile = async (file: File) => {
	const r = await importPeek(file);
	if (r.databaseVersion < statsDb.verno) {
		await importIntoDatabaseMergeAndUpgrade(file);
	} else {
		await importIntoDatabase(file);
	}
}

const confirmBeforeCleanImport = () => {
	// TODO: use modal
	const confirm1 = window.confirm('Importing this file will delete all your current progress. Are you sure you want to continue? This can NOT be undone.');
	if (!confirm1) return false;
	const confirm2 = window.confirm('Last warning. All previous progress will be deleted. Are you really sure?');
	return !!confirm2;
}

const importIntoDatabase = async (blob: Blob) => {
	if (numSolved.value > 0) {
		return importIntoDatabaseMergeAndUpgrade(blob);
	}
	if (!confirmBeforeCleanImport()) return;
	
	try {
		const result = await cleanImportPuzzleHistoryDb(statsDb, blob);
		console.log({ importResult: result });
		console.log('successful import!');
		// TODO: better message (modal?) that shows umport was successful
		window.alert('Succesfully imported stats!');
	} catch(e) {
		window.alert(`An error occurred importing stats...\n${(e as Error).message}`);
	} finally {
		console.log('running update num solved');
		updateNumSolved();
	}
}

const importIntoDatabaseMergeAndUpgrade = async (blob: Blob) => {
	try {
		const result = await importPuzzleHistoryItemsWithVersionUpgrade(statsDb, blob);
		console.log(result);
	} catch(e) {
		console.error(e);
	} finally {
		console.log('running update num solved');
		updateNumSolved();
	}
}

const importStats = async () => {
	fileInput.value?.click();
}

const resetStats = async () => {
	// TODO: use modal
	const confirm1 = window.confirm('Are you sure you want to delete all your statistics, including game history and other progress? This can NOT be undone.');
	if (!confirm1) return;
	const confirm2 = window.confirm('Are you really sure??!');
	if (!confirm2) return;

	try {
		await statsDb.clearTable('puzzleHistory');
		window.alert('Puzzle statistics and puzzle history have succesfully been reset.');
	} catch(e) {
		const str = `[ERROR]: Puzzle statistics and history could not be reset due to error, or something else went wrong: ${(e as Error).message}`;
		window.alert(str);
	} finally {
		// TODO: update stats?
		updateNumSolved();
	}
}
</script>