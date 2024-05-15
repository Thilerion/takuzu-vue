import Dexie from 'dexie';
import { persistStorage } from '@/services/storage-manager.js';
import { StatsDbHistoryEntry, type StatsDbHistoryEntryWithId } from './models.js';
import { initStatsDbVersionUpgrades } from './versions.js';
import type { BasicPuzzleConfig, BoardShape } from '@/lib/types';

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

	getUniquePlayedSizes(): Promise<BoardShape[]> {
		return this.puzzleHistory.orderBy('[width+height]').uniqueKeys().then(keys => {
			return (keys as unknown as [number, number][]).map(([width, height]) => {
				return { width, height };
			});
		});
	}
	getUniquePlayedDifficulties(): Promise<StatsDbHistoryEntry['difficulty'][]> {
		return this.puzzleHistory.orderBy('difficulty').uniqueKeys() as unknown as Promise<StatsDbHistoryEntry['difficulty'][]>;
	}
	getUniquePlayedPuzzleConfigs(): Promise<BasicPuzzleConfig[]> {
		return this.puzzleHistory.orderBy('[width+height+difficulty]').uniqueKeys().then(confKeys => {
			return (confKeys as unknown as [number, number, StatsDbHistoryEntry['difficulty']][]).map(([width, height, difficulty]) => {
				return { width, height, difficulty };
			});
		});
	}

	getTotalSolved(): Promise<number> {
		return this.puzzleHistory.count();
	}
	getTotalSolvedAfterDate(timestamp: number) {
		return this.puzzleHistory.where('timestamp').above(timestamp).count();
	}

	getAll(): Promise<StatsDbHistoryEntryWithId[]> {
		return this.puzzleHistory.toArray();
	}

	async addEntry(entry: StatsDbHistoryEntry, updateItemId: boolean): Promise<number> {
		const id = await this.puzzleHistory.add(entry as StatsDbHistoryEntryWithId);
		if (updateItemId) {
			entry.id = id;
		}
		return id;
	}
	async deleteEntry(id: number): Promise<void> {
		await this.puzzleHistory.delete(id);
	}
	async updateItem(id: number, modifiedKeys: Partial<StatsDbHistoryEntry> | Record<string, any>): Promise<boolean> {
		const success = await this.puzzleHistory.update(id, modifiedKeys);
		if (!success) {
			console.warn(`Updating item with primary key "${id}" failed; probably because no item could be found with this key.`);
		}
		return !!success;
	}

	async clearTable(table: StatsDbTableKey = 'puzzleHistory'): Promise<void> { 
		return await this[table].clear();
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