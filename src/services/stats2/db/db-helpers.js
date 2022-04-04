import { db } from "./initDb.js";

const clearTableFromDb = (db, table) => db[table].clear();
const addItemToDb = (db, table) => async (item, updateItemId = true) => {
	const primaryKey = await db[table].add(item);
	if (updateItemId) item.id = id;
	return primaryKey;
}
const updateItemInDb = (db, table) => async (primaryKey, modifiedKeys = {}) => {
	const success = await db[table].update(primaryKey, modifiedKeys);
	if (!updateSuccess) {
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

export const clearTable = (table = 'puzzleHistory') => clearTableFromDb(db, table);
export const add = addItemToDb(db, 'puzzleHistory');
export const update = updateItemInDb(db, 'puzzleHistory');
export const put = putItemInDb(db, 'puzzleHistory');