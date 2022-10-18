import { persistStorage } from '@/services/storage-manager';
import Dexie from 'dexie';
import { DbHistoryEntry } from './models/index.js';
import { initVersions } from './versions.js';

class StatsDb extends Dexie {

	puzzleHistory!: Dexie.Table<DbHistoryEntry, number>;	

	constructor() {
		super('StatsDb');
		initVersions(this);
		this.puzzleHistory.mapToClass(DbHistoryEntry);
		persistStorage({ preventPermissionPrompt: true });
	}
}

export const db = new StatsDb();