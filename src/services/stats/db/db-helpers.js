import { db } from "./initDb";

const clearTableFromDb = (db, table) => db[table].clear();
const addItemToDb = (db, table) => async (item, updateItemId = true) => {
	const primaryKey = await db[table].add(item);
	if (updateItemId) item.id = primaryKey;
	return primaryKey;
}
const updateItemInDb = (db, table) => async (primaryKey, modifiedKeys = {}) => {
	const success = await db[table].update(primaryKey, modifiedKeys);
	if (!success) {
		console.warn(`Updating item with primary key "${primaryKey}" failed; probably because no item could be found with this key.`);
	}
	return !!success;
}
const putItemInDb = (db, table) => async (item) => {
	if (item == null) {
		throw new Error('Invalid item to put in db.');
	}
	if (item?.id == null) {
		throw new Error('When putting item in database, it should have a primary key (id). Otherwise, use "add".');
	}
	return await db[table].put(item);
}
const deleteItemFromDb = (db, table) => async (primaryKey) => {
	return await db[table].delete(primaryKey);
}


export const clearTable = (table = 'puzzleHistory') => clearTableFromDb(db, table);
export const add = addItemToDb(db, 'puzzleHistory');
export const update = updateItemInDb(db, 'puzzleHistory');
export const put = putItemInDb(db, 'puzzleHistory');
export const deleteItem = deleteItemFromDb(db, 'puzzleHistory');

export const getCount = (table = 'puzzleHistory') => db[table].count();
export const getAll = async (table = 'puzzleHistory') => {
	return await db[table].toArray();
}