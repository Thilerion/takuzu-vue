import Dexie from 'dexie';
import { exportDB, importInto, peakImportFile } from 'dexie-export-import';
import { db as dbInstance } from '../stats2/db/index.js';

const db = dbInstance;

function clear() {
	return db.puzzleHistory.clear();
}
function dbExport(progressCb) {
	return exportDB(db, {
		prettyJson: true,
		filter: (table) => table === 'puzzleHistory',
		progressCallback: progressCb
	});
}

// import into an existing db, as opposed to importing and then opening the db
function dbImportInto(blob, progressCb) {
	return importInto(db, blob, {
		clearTablesBeforeImport: true,
		filter: table => table === 'puzzleHistory',
		acceptVersionDiff: true,
		progressCallback: progressCb,
		// for some reason, earlier chunks don't get added to the db
		// so that is why the chunk size is so large (128MB)
		chunkSizeBytes: 1024 * 1024 * 128,
	})
}
function itemsImportInto(blob) {
	// import items from blob instead of entire db
	// better when database version has changed since the export
	throw new Error('TODO: not yet implemented');
}
async function dbImportPeek(blob) {
	const importMeta = await peakImportFile(blob);
	console.log({ importMeta });
	console.log("Database name:", importMeta.data.databaseName);
	console.log("Database version:", importMeta.data.databaseVersion);
	console.log("Tables:", importMeta.data.tables.map(t =>
	`${t.name} (${t.rowCount} rows)`
	).join('\n\t'));
}

async function add(item, updateItemId = true) {
	try {
		const id = await db.puzzleHistory.add(item);
		if (updateItemId) {
			item.id = id;
		}
	} catch(e) {
		console.warn('Could not add puzzle history entry to database!');
		console.error(e);
	} finally {
		return item;
	}
}

async function update(primaryKey, modifiedKeys = {}) {
	try {
		const updateSuccess = await db.puzzleHistory.update(primaryKey, modifiedKeys);
		if (!updateSuccess) {
			console.warn(`Updating item with primary key "${primaryKey}" failed; maybe because no item could be found with this key.`);
			return false;
		} else return true;
	} catch (e) {
		console.warn(`Unrecognized Error while updating item with key ${primaryKey}.`)
		console.error(e);
		return false;
	}
}

export function clearPuzzleHistory() {
	return db.puzzleHistory.clear();
}
export function exportPuzzleHistory(progressCb) {
	return exportDB(db, {
		prettyJson: true,
		filter: (table) => table === 'puzzleHistory',
		progressCallback: progressCb
	});
}
export function importPuzzleHistory(blob, progressCb) {
	return importInto(db, blob, {
		clearTablesBeforeImport: true,
		filter: table => table === 'puzzleHistory',
		acceptVersionDiff: true,
		progressCallback: progressCb,
		// for some reason, earlier chunks don't get added to the db
		// so that is why the chunk size is so large (128MB)
		chunkSizeBytes: 1024 * 1024 * 128,
	})
}

export async function importPeak(blob) {
	const importMeta = await peakImportFile(blob);
	console.log({ importMeta });
	console.log("Database name:", importMeta.data.databaseName);
	console.log("Database version:", importMeta.data.databaseVersion);
	console.log("Database version:", importMeta.data.databaseVersion);
	console.log("Tables:", importMeta.data.tables.map(t =>
	`${t.name} (${t.rowCount} rows)`
	).join('\n\t'));
}

export const puzzleHistoryTable = db.puzzleHistory;
export default db;

export const puzzleHistoryDb = {
	dbExport,
	dbImportInto,
	dbImportPeek,
	itemsImportInto,
	
	clear,
	add,
	update
}