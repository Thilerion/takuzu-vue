import { exportDB, importInto, peakImportFile } from "dexie-export-import";

export async function importPeek(blob) {
	const importMeta = await peakImportFile(blob);
	const { data } = importMeta;
	const { databaseName, databaseVersion, tables } = data;
	const tableStr = tables.map(t => `${t.name} (with: ${t.rowCount} rows)`).join('\n\t');

	console.groupCollapsed('Import peek');
	console.log(`Database name: ${databaseName}`);
	console.log(`Database version: ${databaseVersion}`);
	console.log(`Tables: ${tableStr}`);
	console.groupEnd();

	return { databaseName, databaseVersion, tables, _importMeta: importMeta };
}

export function exportPuzzleHistoryDb(db, options = {}) {
	const mergedOpts = {
		prettyJson: true,
		filter: table => table === 'puzzleHistory',
		...options,
	}
	return exportDB(db, mergedOpts);
}

export async function cleanImportPuzzleHistoryDb(db, blob, options = {}) {
	console.warn('WARNING: this function clears the database before importing.');

	const mergedOpts = {
		acceptVersionDiff: false,
		filter: table => table === 'puzzleHistory',
		clearTablesBeforeImport: true,
		overwriteValues: false,
		...options,
		// for some reason, earlier chunks don't get added to the db
		// so that is why the chunk size is so large (128MB)
		chunkSizeBytes: 1024 * 1024 * 128,
	}

	try {
		await db.puzzleHistory.clear();
		const importResult = await importInto(db, blob, mergedOpts);
		return importResult ?? true;
	} catch (e) {
		console.warn('Error during clean import of puzzle history db.');
		console.error(e);
		return false;
	}
}