import { formatYYYYMMDD } from "@/utils/date.utils.js";

const dbVersions = [
	{
		version: 2,
		stores: {
			puzzleHistory: "++id,[width+height],difficulty,date,timeElapsed,[width+height+difficulty]"
		},
		upgrade: null
	},
	{
		version: 3,
		stores: {
			puzzleHistory: "++id,[width+height],difficulty,timestamp,localDateStr,timeElapsed,[width+height+difficulty],flags.favorite"
		},
		upgrade: tx => {
			return tx.puzzleHistory.toCollection().modify(upgradeItemFrom2to3);
		}
	}
].sort((a, b) => a.version - b.version);

function upgradeItemFrom2to3(item) {
	const { date } = item;
	delete item.date;

	const timestamp = new Date(date).getTime();
	item.timestamp = timestamp;

	const localDateStr = formatYYYYMMDD(timestamp);
	item.localDateStr = localDateStr;

	const { flags = {} } = item;
	item.flags = { ...flags };
}

export const initVersions = (db, upToVersion = Infinity) => {
	for (const versionObj of dbVersions) {
		const { version, stores, upgrade } = versionObj;
		if (version > upToVersion) break;

		const applyUpgradeTransaction = upgrade != null;

		if (applyUpgradeTransaction) {
			db.version(version).stores(stores).upgrade((tx) => upgrade(tx));
		} else {
			db.version(version).stores(stores);
		}
	}
}