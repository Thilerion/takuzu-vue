import Dexie from 'dexie';

const db = new Dexie('StatsDB');
db.version(1).stores({
	puzzleHistory: "++id,[width+height],difficulty,date,timeElapsed"
});
db.open();

export const puzzleHistoryDb = db.puzzleHistory;
export default db;