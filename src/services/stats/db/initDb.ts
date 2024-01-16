import { persistStorage } from '@/services/storage-manager';
import Dexie from 'dexie';
import { DbHistoryEntry } from './models';
import { initVersions } from './versions.js';

class StatsDB extends Dexie {
	puzzleHistory!: Dexie.Table<Omit<DbHistoryEntry, 'id'> & { id: number }, number>;
	constructor() {
		super('StatsDB');
		initVersions(this);
	}
}

export type StatsDBTable = 'puzzleHistory';

// const db = new Dexie('StatsDB');

// initVersions(db);

const db = new StatsDB();
db.open();

db.puzzleHistory.mapToClass(DbHistoryEntry);

persistStorage({ preventPermissionPrompt: true });

export { db, type StatsDB };