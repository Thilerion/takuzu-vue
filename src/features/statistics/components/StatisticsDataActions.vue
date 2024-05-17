<template>
<div
	class="flex justify-center items-center gap-2"
	:class="{ 'cursor-progress *:pointer-events-none': isBusy }"
>

	<button
		class="text-btn"
		:disabled="!numSolved || isBusy"
		@click="exportStats"
	>{{ $t('Statistics.export-data') }}</button>

	<button
		class="text-btn"
		:disabled="isBusy"
		@click="openFileDialogIfNotBusy"
	>{{ $t('Statistics.import-stats') }}</button>

	<button
		class="text-btn danger"
		:disabled="!numSolved || isBusy"
		@click="resetStats"
	>{{ $t('Statistics.reset-stats') }}</button>

</div>
</template>

<script setup lang="ts">
// TODO: loading spinner while "isBusy"

import { useStatisticsNextStore } from '../store.js';
import { storeToRefs } from 'pinia';
import { StatsDbDataUtils } from '../services/StatsDbDataUtils.service.js';
import { awaitTimeout } from '@/utils/delay.utils.js';
import { iterateFiles } from '@/utils/file.utils.js';
import { ref, computed } from 'vue';
import { useFileDialog } from '../composables/file-dialog.js';

const statsNextStore = useStatisticsNextStore();
const { numSolved } = storeToRefs(statsNextStore);

// Set to true when resetting/importing/exporting, to prevent duplicate operations
const dbActionStatus = ref<null | 'export' | 'import' | 'reset'>(null);
const isBusy = computed(() => dbActionStatus.value != null);

// TODO: do not use window.alert in production, use a proper notification system or a custom alert
function handleErrorMessage(e: Error | string, alertMessage?: string): void {
	console.error(e);
	window.alert(alertMessage ?? (e instanceof Error ? e.message : e));
}
const toErrorOrString = (e: unknown): Error | string => (e instanceof Error) ? e.message : (typeof e === 'string') ? e : String(e);
// Prevent flickering of loading spinner by waiting for a minimum amount of time
async function getResultAfterMinTimeout<T>(promise: Promise<T>, minTimeout = 1000): Promise<T> {
	const [result] = await Promise.all([
		promise,
		awaitTimeout(minTimeout)
	]);
	return result;
}

async function resetStats() {
	try {
		dbActionStatus.value = 'reset';
		await getResultAfterMinTimeout(
			StatsDbDataUtils.resetDatabase(),
			1000
		);
		// TODO: use a proper notification system or a custom alert
		window.alert('Stats reset successfully');
	} catch(e) {
		handleErrorMessage(toErrorOrString(e), 'Failed to reset stats. Please try again later.');
	} finally {
		if (dbActionStatus.value === 'reset') {
			dbActionStatus.value = null;
		}
		// update stats
		await statsNextStore.initialize({ forceUpdate: true });
	}
}

async function exportStats() {
	try {
		dbActionStatus.value = 'export';
		const result = await getResultAfterMinTimeout(
			StatsDbDataUtils.exportHistoryToJson({
				exportOpts: {
					prettyJson: !(import.meta.env.DEV)
				}
			}),
			1000
		);
		const { filename, url } = result;
		const anchorEl = document.createElement('a');
		anchorEl.href = url;
		anchorEl.download = filename;
		anchorEl.click();
	} catch(e) {
		handleErrorMessage(toErrorOrString(e), 'Failed to export stats. Please try again later.');
	} finally {
		if (dbActionStatus.value === 'export') {
			dbActionStatus.value = null;
		}
	}	
}

const {
	reset: resetFileDialog,
	open: openFileDialog
} = useFileDialog({
	multiple: true,
	accept: '.json,application/json',
	onChange: startImport
})

function openFileDialogIfNotBusy() {
	if (isBusy.value) return;
	openFileDialog({ reset: true });
}


/** Import stats db files, and update/initialize statsStore if import was successful */
async function startImport(files: FileList | null) {
	if (!files) return;
	const result = await importStatsDbFiles(files);
	if (result) {
		// update stats
		await statsNextStore.initialize({ forceUpdate: true });
	}
} 

/**
 * Parses all files in the event target's file list, so they can be imported into the statsDb.
 * If the database is currently empty, it performs a simple, full, import.
 * Else, if the database is not empty, it tries to perform a merge with a potential version upgrade.
 * Finally, it resets the file input element's value.
 */
async function importStatsDbFiles(fileList: FileList): Promise<boolean> {
	// TODO: set minimum timeout to prevent flickering of loading spinner
	try {
		dbActionStatus.value = 'import';
		const { files, version, isCurrentVersion } = await validateStatsDbFileList(fileList);
		if (files.length === 0) {
			return true;
		}
		console.log('Files validated', { files: [...files], version });

		// TODO: importIntoEmptyDatabase requires that the version is the most current!!
		if (statsNextStore.numSolved === 0 && files.length === 1 && isCurrentVersion) {
			return await StatsDbDataUtils.importIntoEmptyDatabase(files[0]);
		} else if (statsNextStore.numSolved === 0 && files.length > 1 && isCurrentVersion) {
			// Import the first using "intoEmptyDatabase", then merge import the rest
			const [firstFile, ...restFiles] = files;
			await StatsDbDataUtils.importIntoEmptyDatabase(firstFile);
			return await StatsDbDataUtils.mergeImportIntoDatabase(restFiles);
		} else {
			return await StatsDbDataUtils.mergeImportIntoDatabase(files);
		}
	} catch(e) {
		handleErrorMessage(toErrorOrString(e), 'Failed to import stats. Please try again later.');
		return false;
	} finally {
		if (dbActionStatus.value === 'import') {
			dbActionStatus.value = null;
		}

		resetFileDialog();
	}
}

async function validateStatsDbFileList(list: FileList): Promise<{ files: File[], version: number, isCurrentVersion: boolean }> {
	if (list == null) {
		throw new Error('HTML File element files property is null.');
	} else if (list.length === 0) {
		return { files: [], version: -1, isCurrentVersion: true };
	}

	const filesArray: File[] = [];
	for (const file of iterateFiles(list)) {
		// Must be a JSON file
		if (!file.type.includes('json')) {
			throw new Error('Invalid file type. Please select a JSON file.');
		}
		filesArray.push(file);
	}

	// All files themselves are valid, now validate their contents
	const peekResults = await StatsDbDataUtils.getFileListMetadata(filesArray);
	
	// Make sure all files use the same database version and database name. This makes parsing/importing much easier.
	const versionA = peekResults[0].data.databaseVersion;
	const dbNameA = peekResults[0].data.databaseName;
	if (peekResults.some(r => r.data.databaseVersion !== versionA || r.data.databaseName !== dbNameA)) {
		throw new Error('All files must have the same database version and database name.');
	}

	const currentDbVersion = StatsDbDataUtils.getCurrentVersion();
	const isCurrentVersion = versionA === currentDbVersion;
	return { files: filesArray, version: versionA, isCurrentVersion };
}
</script>