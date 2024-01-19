import Dexie from 'dexie';
import { persistStorage } from '@/services/storage-manager.js';
import { StatsDbHistoryEntry, type StatsDbHistoryEntryWithId } from './models.js';
import { initStatsDbVersionUpgrades } from './versions.js';

type StatsDbTableKey = 'puzzleHistory';
type StatsDbTableValue = Dexie.Table<StatsDbHistoryEntryWithId, number>;
type WithStatsDbTable = {
	[Key in StatsDbTableKey]: StatsDbTableValue;
}

class StatsDB extends Dexie implements WithStatsDbTable {
	puzzleHistory!: StatsDbTableValue;

	constructor() {
		super('StatsDB');
		initStatsDbVersionUpgrades(this);
		this.puzzleHistory.mapToClass(StatsDbHistoryEntry);
	}
}

const db = new StatsDB();

persistStorage({ preventPermissionPrompt: true });

const puzzleHistoryTable = db.puzzleHistory;

export {
	db as statsDb, // originally: exported as db
	puzzleHistoryTable,

	type StatsDB,
	type StatsDbTableKey,
	type StatsDbTableValue
}