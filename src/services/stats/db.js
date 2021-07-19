import Dexie from 'dexie';
import { exportDB, importInto, peakImportFile } from 'dexie-export-import';

const db = new Dexie('StatsDB');
db.version(2).stores({
	puzzleHistory: "++id,[width+height],difficulty,date,timeElapsed,[width+height+difficulty]"
});
db.open();

export function clearPuzzleHistory() {
	return puzzleHistoryTable.clear();
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