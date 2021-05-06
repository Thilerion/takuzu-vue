import Dexie from 'dexie';

const db = new Dexie('StatsDB');
db.version(2).stores({
	puzzleHistory: "++id,[width+height],difficulty,date,timeElapsed,[width+height+difficulty]"
});
db.open();

export const puzzleHistoryDb = db.puzzleHistory;
export default db;