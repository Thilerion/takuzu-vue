import type { StatsDB, StatsDbTableKey } from "./init.js";
import type { Version, Transaction } from "dexie";
import { formatYYYYMMDD } from "@/utils/date.utils.js";

type StatsDbVersionUpgradeData = {
	version: number,
	stores: Record<StatsDbTableKey, string | null>,
	upgrade: null | Parameters<Version['upgrade']>[0]
}

const statsDbVersionUpgrades = ([
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
		upgrade: (tx: Transaction) => {
			return (tx as unknown as StatsDB).puzzleHistory.toCollection().modify(upgradeItemFrom2to3);
		}
	},
	{
		version: 4,
		stores: {
			puzzleHistory: "++id,[width+height],difficulty,timestamp,localDateStr,timeElapsed,[width+height+difficulty],flags.favorite,initialBoard"
		},
		upgrade: null
	}
] as const satisfies StatsDbVersionUpgradeData[]).sort((a, b) => a.version - b.version);

function upgradeItemFrom2to3(item: any) {
	// item is actually a StatsDbHistoryEntry, but from a previous version, which is not typed anymore
	const { date } = item;
	delete item.date;

	const timestamp = new Date(date).getTime();
	item.timestamp = timestamp;

	const localDateStr = formatYYYYMMDD(timestamp);
	item.localDateStr = localDateStr;

	const { flags = {} } = item;
	item.flags = { ...flags };
}

const applyVersionUpgrader = (db: StatsDB, data: StatsDbVersionUpgradeData) => {
	const { version, stores, upgrade: upgraderFn } = data;
	// if (version > upToVersion) break; // is implemented by calling function

	if (upgraderFn != null) {
		return db.version(version).stores(stores).upgrade((tx) => upgraderFn(tx));
	} else {
		return db.version(version).stores(stores);
	}
}

export async function initStatsDbVersionUpgrades(db: StatsDB, upToVersion = Infinity) {
	let lastVersionUpgrade: Version | undefined;
	for (const versionData of statsDbVersionUpgrades) {
		const { version } = versionData;
		if (version > upToVersion) break;

		lastVersionUpgrade = applyVersionUpgrader(db, versionData);
	}
	return lastVersionUpgrade;
}