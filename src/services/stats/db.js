import Dexie from 'dexie';
import { exportDB, importInto } from 'dexie-export-import';

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
		progressCallback: progressCb
	})
}

export const puzzleHistoryTable = db.puzzleHistory;
export default db;