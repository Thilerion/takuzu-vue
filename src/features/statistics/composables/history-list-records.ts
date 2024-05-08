import type { PuzzleConfigKey } from "@/lib/types.js";
import type { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";
import { groupBy } from "@/utils/array.ts.utils.js";
import { ref, type Ref } from "vue";

type ItemId = NonNullable<StatsDbExtendedStatisticDataEntry['id']>;
export type HistoryListRecordsLists = {
	/** The items that were the first solve of a specific puzzle config */
	first: Set<ItemId>;
	/** The current time records. Can theoretically also be in "first" */
	timeCurrent: Set<ItemId>;
	/** All items that are or were a time record (which includes the current and first) */
	timeAll: Set<ItemId>;
}

const groupItemsByPuzzleConfig = (items: StatsDbExtendedStatisticDataEntry[]): Record<PuzzleConfigKey, StatsDbExtendedStatisticDataEntry[]> => {
	return groupBy(items, 'puzzleConfigKey');
}

export const useHistoryListRecords = (itemsByDate: Ref<StatsDbExtendedStatisticDataEntry[]>) => {
	const result = ref<HistoryListRecordsLists>({
		first: new Set(),
		timeCurrent: new Set(),
		timeAll: new Set(),
	});

	// Make sure items are sorted in the correct order, so that the first item is the oldest
	if (itemsByDate.value.length > 1) {
		const [first, second] = itemsByDate.value;
		if (first.timestamp > second.timestamp) {
			throw new Error('Items are not sorted in the correct order');
		}
	}

	const grouped = groupItemsByPuzzleConfig(itemsByDate.value);

	// Iterate over each group, then over each item in that group, while
	// keeping track of the "current best", and storing all records in one array.
	// Afterwards, the first is added to first, and the last is added to timeCurrent, and all are added to timeAll.
	for (const items of Object.values(grouped)) {
		const allTimeRecords: ItemId[] = [];
		let currentBestTime = Infinity;

		for (const item of items) {
			const { timeElapsed, id } = item;
			if (id == null) continue;
			if (timeElapsed < currentBestTime) {
				currentBestTime = timeElapsed;
				allTimeRecords.push(id);
			}
		}

		if (allTimeRecords.length === 0) continue;
		
		const first = allTimeRecords[0];
		const current = allTimeRecords.at(-1)!;

		result.value.first.add(first);
		result.value.timeCurrent.add(current);
		for (const id of allTimeRecords) result.value.timeAll.add(id);
	}

	return result;
}