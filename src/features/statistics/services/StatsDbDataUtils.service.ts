import { statsDb } from "@/services/db/stats-db/init.js";
import { cleanImportPuzzleHistoryDb, importPuzzleHistoryItemsWithVersionUpgrade, exportPuzzleHistoryDb, importPeek, type ExportPuzzleHistoryDbOpts } from "@/services/db/stats-db/stats-db-import-export.js";
import { formatYYYYMMDD } from "@/utils/date.utils.js";

const resetDatabase = async (): Promise<void> => {
	if (import.meta.env.DEV) {
		const tableNames = statsDb.tables.map(t => t.name);
		if (tableNames.length !== 1 || tableNames[0] !== 'puzzleHistory') {
			console.warn('Unexpected tables in statsDb:', tableNames);
		}
	}
	return await statsDb.clearTable('puzzleHistory');
}

export type DownloadExportHistoryOpts = {
	exportOpts?: ExportPuzzleHistoryDbOpts;
	filename?: string;
}
const exportHistoryToJson = async (opts: DownloadExportHistoryOpts = {}): Promise<{
	url: string;
	filename: string;
	blob: Blob;
}> => {
	const blob = await exportPuzzleHistoryDb(statsDb, opts.exportOpts ?? {});
	let filename = opts.filename;
	if (filename != null && !filename.endsWith('.json')) {
		filename += '.json';
	} else if (!filename) {
		const dateStr = formatYYYYMMDD(Date.now()).replaceAll('-', '');
		const count = await statsDb.getTotalSolved();
		const verno = statsDb.verno;
		filename = `puzzle-history-${dateStr}-solved_${count}-v${verno}.json`;
	}
	return {
		url: URL.createObjectURL(blob),
		filename,
		blob,
	};
}

async function getFileListMetadata(files: File[]) {
	const results = await Promise.all([
		...files.map(async file => {
			const data = await importPeek(file);
			return { data, file }
		})
	])
	return results;
}

async function importIntoEmptyDatabase(file: File): Promise<boolean> {
	return cleanImportPuzzleHistoryDb(statsDb, file);
}
async function mergeImportIntoDatabase(files: File[]): Promise<boolean> {
	for await (const file of files) {
		const result = await importPuzzleHistoryItemsWithVersionUpgrade(statsDb, file);
		if (!result) throw new Error('Import failed');
	}
	return true;
}

export const StatsDbDataUtils = {
	resetDatabase,
	exportHistoryToJson,
	getFileListMetadata,
	importIntoEmptyDatabase,
	mergeImportIntoDatabase,
	getCurrentVersion: () => statsDb.verno,
}