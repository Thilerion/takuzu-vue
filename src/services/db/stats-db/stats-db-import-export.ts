import { exportDB, peakImportFile, type ExportOptions, type ImportOptions, importInto } from "dexie-export-import";
import Dexie from "dexie";

import type { StatsDB } from "./init.js";
import { readJsonFile, writeObjToBlob } from "@/utils/file.utils.js";
import { initStatsDbVersionUpgrades } from "./versions.js";

export type ExportPuzzleHistoryDbOpts = Partial<Omit<ExportOptions, 'filter'>>;
export type ImportPuzzleHistoryDbOpts = Partial<Omit<ImportOptions, 'chunkSizeBytes' | 'filter'>>;

const TEMP_STATS_DB_NAME = 'tempStatsDb';

export async function importPeek(blob: Blob) {
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

export function exportPuzzleHistoryDb(db: StatsDB, options: ExportPuzzleHistoryDbOpts = {}) {
	const mergedOpts = {
		prettyJson: true,
		filter: (table: string) => table === 'puzzleHistory',
		...options,
	}
	return exportDB(db, mergedOpts);
}

export async function cleanImportPuzzleHistoryDb(db: StatsDB, blob: Blob, options: ImportPuzzleHistoryDbOpts = {}) {
	console.warn('WARNING: this function clears the database before importing.');

	const mergedOpts = {
		acceptVersionDiff: false,
		filter: (table: string) => table === 'puzzleHistory',
		clearTablesBeforeImport: true,
		overwriteValues: false,
		...options,
		// for some reason, earlier chunks don't get added to the db
		// so that is why the chunk size is so large (128MB)
		chunkSizeBytes: 1024 * 1024 * 128,
	}

	try {
		await db.puzzleHistory.clear();
		await importInto(db, blob, mergedOpts);
		return true;
	} catch (e) {
		console.warn('Error during clean import of puzzle history db.');
		console.error(e);
		return false;
	}
}

async function deleteDatabaseContents(dbName: string = TEMP_STATS_DB_NAME) {
	let db: Dexie | undefined = new Dexie(dbName);
	try {
		await db.delete();
		console.log('succesfully deleted database');
		db = undefined;
		return true;
	} catch (e) {
		console.warn('could not delete database.')
		console.error(e);
		db = undefined;
		return false;
	}
}

export async function importPuzzleHistoryItemsWithVersionUpgrade(db: StatsDB, blob: Blob) {
	let tempStatsDb: StatsDB | undefined = undefined;

	try {
		// just to make sure it doesn't exist
		await deleteDatabaseContents(TEMP_STATS_DB_NAME);

		const obj = await readJsonFile(blob);
		// set database name so it doesn't get imported into the original database
		(obj as any).data.databaseName = TEMP_STATS_DB_NAME;

		const modifiedDbBlob = writeObjToBlob(obj as any)!;

		tempStatsDb = await Dexie.import(modifiedDbBlob, {
			chunkSizeBytes: 1024 * 1024 * 128
		}) as StatsDB;
		await tempStatsDb.close();

		initStatsDbVersionUpgrades(tempStatsDb);

		await tempStatsDb.open();

		const allItems = await tempStatsDb.puzzleHistory.toArray();

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
			} catch (e) {
				console.error('Could not close and delete tempStatsDb!');
				console.error(e);
			}			
		}
	}
}

async function addImportedItemsToDatabase(db: StatsDB, allItems: any[]) {
	return db.transaction('rw', db.puzzleHistory, async () => {
		const currentKeys = new Set(
			await db.puzzleHistory.toCollection().primaryKeys()
		);
		const currentTimestamps = new Set(
			await db.puzzleHistory.orderBy('timestamp').keys()
		);

		// never import items with an already existing timestamp
		const itemsWithUniqueTimestamp = allItems.filter(item => {
			return !currentTimestamps.has(item.timestamp);
		});

		const duplicateTimestampCount = allItems.length - itemsWithUniqueTimestamp.length;

		const itemsToAdd = [];
		const itemsToAddWithoutId = [];

		// if timestamp does not exist, but id is duplicate, remove id and add it anyway
		for (const item of itemsWithUniqueTimestamp) {
			if (currentKeys.has(item.id)) {
				const copy = { ...item };
				delete copy.id;
				itemsToAddWithoutId.push(copy);
			} else {
				itemsToAdd.push(item);
			}
		}
		console.log('Begin adding items to puzzleHistory database.');

		// first add items that have id
		const uniqueAddedIds = await db.puzzleHistory.bulkAdd(itemsToAdd, undefined, {
			allKeys: true
		}) as unknown as number[];
		// only now add items without id. This is to prevent id-less items from getting an id assigned, that is already present later in the list
		const newAddedIds = await db.puzzleHistory.bulkAdd(itemsToAddWithoutId, undefined, {
			allKeys: true
		}) as unknown as number[];
		
		console.log('done adding items');

		const result = {
			addedTotal: uniqueAddedIds.length + newAddedIds.length,
			skipped: duplicateTimestampCount,
			addedUnchanged: uniqueAddedIds.length,
			addedNewId: newAddedIds.length
		};
		return result;

	}).then((results) => {
		console.log('Transaction complete and committed.');
		return results;
	}).catch(err => {
		console.warn('Transaction failed.');
		console.error(err);
		return null;
	})
}