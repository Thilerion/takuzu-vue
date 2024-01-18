export * from './stats-db-helpers.js';
export { 
	// statsDb,
	statsDb as db, // TODO: remove this; it was the original name under which it was exported
	puzzleHistoryTable,

	type StatsDB,
	type StatsDbTableKey,
	type StatsDbTableValue
} from './init.js';

export * as StatsDbImportExport from './stats-db-import-export.js';
export * from './models.js';