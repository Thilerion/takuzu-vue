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

	clearHistory() {
		return this.puzzleHistory.clear();
	}
	async addHistoryItem(item: DbHistoryEntry, updateItemId = true) {
		const primaryKey = await this.puzzleHistory.add(item);
		if (updateItemId) item.id = primaryKey;
		return primaryKey;
	}
	async updateHistoryItem(primaryKey: number, modifiedProps: Partial<DbHistoryEntry> = {}) {
		const success = await this.puzzleHistory.update(primaryKey, modifiedProps);
		if (!success) {
			console.warn(`Updating item with primary key "${primaryKey}" failed; probably because no item could be found with this key.`);
		}
		return !!success;
	}
	putHistoryItem(item: DbHistoryEntry) {
		if (item == null) {
			throw new Error('Invalid item to put in db.');
		}
		if (item?.id == null) {
			throw new Error('When putting item in database, it should have a primary key (id). Otherwise, use "add".');
		}
		return this.puzzleHistory.put(item);
	}
	deleteHistoryItem(primaryKey: number) {
		return this.puzzleHistory.delete(primaryKey);
	}

	getCount(table: Parameters<typeof this.table>[0] = 'puzzleHistory') {
		return this.table(table).count();
	}
	getAll(table: Parameters<typeof this.table>[0] = 'puzzleHistory') {
		return this.table(table).toArray();
	}
}

export const db = new StatsDb();