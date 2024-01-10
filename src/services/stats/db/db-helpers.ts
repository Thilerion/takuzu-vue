import type Dexie from "dexie";
import { db, type StatsDBTable } from "./initDb.js";
import { DbHistoryEntry } from "./models.js";

const clearTableFromDb = (_db: Dexie, table: string) => ((_db as any)[table] as Dexie.Table).clear();
const addItemToDb = <Item>(_db: Dexie, table: string) => async (item: Item, updateItemId = true) => {
	const primaryKey = await (_db as any)[table].add(item);
	if (updateItemId) (item as any).id = primaryKey;
	return primaryKey as number;
}
const updateItemInDb = (_db: Dexie, table: string) => async (primaryKey: unknown, modifiedKeys = {}) => {
	const success = await (_db as any)[table].update(primaryKey, modifiedKeys);
	if (!success) {
		console.warn(`Updating item with primary key "${primaryKey}" failed; probably because no item could be found with this key.`);
	}
	return !!success;
}
const putItemInDb = <Item extends { id?: number }>(_db: Dexie, table: string) => async (item: Item) => {
	if (item == null) {
		throw new Error('Invalid item to put in db.');
	}
	if (item?.id == null) {
		throw new Error('When putting item in database, it should have a primary key (id). Otherwise, use "add".');
	}
	return await ((_db as any)[table] as Dexie.Table<unknown, unknown>).put(item);
}
const deleteItemFromDb = (_db: Dexie, table: string) => async (primaryKey: number) => {
	return await ((_db as any)[table] as Dexie.Table<unknown, number>).delete(primaryKey);
}


export const clearTable = (table: StatsDBTable = 'puzzleHistory') => clearTableFromDb(db, table);
export const add = addItemToDb<DbHistoryEntry>(db, 'puzzleHistory');
export const update: (primaryKey: number, modifiedKeys?: Partial<DbHistoryEntry> | Record<string, any>) => Promise<boolean> = updateItemInDb(db, 'puzzleHistory');
export const put = putItemInDb<DbHistoryEntry>(db, 'puzzleHistory');
export const deleteItem = deleteItemFromDb(db, 'puzzleHistory');

export const getCount = (table: StatsDBTable = 'puzzleHistory') => db[table].count();
export const getAll = async (table: StatsDBTable = 'puzzleHistory') => {
	return await db[table].toArray();
}