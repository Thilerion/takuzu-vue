import { readJsonFile, writeObjToBlob } from "@/utils/file.utils.js";
import Dexie from "dexie";
import { exportDB, importInto, peakImportFile } from "dexie-export-import";
import { initVersions } from "./versions.js";

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

export async function importPuzzleHistoryItemsWithVersionUpgrade(db, blob) {
	let tempStatsDb;
	try {
		const obj = await readJsonFile(blob);

		obj.data.databaseName = 'tempStatsDb';

		const blob2 = writeObjToBlob(obj);

		tempStatsDb = await Dexie.import(blob2, {
			chunkSizeBytes: 1024 * 1024 * 128
		});
		await tempStatsDb.close();

		initVersions(tempStatsDb);

		await tempStatsDb.open();

		const allItems = await tempStatsDb.puzzleHistory.toArray();
		console.log({ allItems });

		await addImportedItemsToDatabase(db, allItems);

		return true;
	} catch (e) {
		console.warn('Error during importing puzzle history with version upgrade.');
		throw e;
	} finally {
		if (tempStatsDb) {
			try {
				tempStatsDb.close();
				tempStatsDb.delete();
			} catch {}			
		}
	}
}

async function addImportedItemsToDatabase(db, allItems) {
	const currentKeys = new Set(
		await db.puzzleHistory.toCollection().primaryKeys()
	);

	const itemsWithDuplicateId = [];
	const itemsWithUniqueId = [];

	for (const item of allItems) {
		if (currentKeys.has(item.id)) {
			const copy = { ...item };
			delete copy.id;
			itemsWithDuplicateId.push(copy);
		} else {
			itemsWithUniqueId.push(item);
		}
	}

	console.log('now adding items with unique id: ' + itemsWithUniqueId.length);
	await db.puzzleHistory.bulkAdd(itemsWithUniqueId);
	console.log('done');

	console.log('now parsing items with duplicate ids: ' + itemsWithDuplicateId.length);
	const currentTimestamps = new Set(
		await db.puzzleHistory.orderBy('timestamp').keys()
	);
	
	const duplicateTimestamps = [];
	const uniqueTimestamps = [];

	for (const item of itemsWithDuplicateId) {
		const timestamp = item.timestamp;
		if (currentTimestamps.has(timestamp)) {
			duplicateTimestamps.push(item);
		} else {
			uniqueTimestamps.push(item);
		}
	}

	console.log(`Found ${duplicateTimestamps.length} items with duplicate timestamps, and ${uniqueTimestamps.length} items with unique timestamps.`);
	console.log('nog adding items with unique timestamps');
	await db.puzzleHistory.bulkAdd(uniqueTimestamps);
	console.log('done');

	return true;
}