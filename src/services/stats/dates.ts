import { subDays, isBefore } from "date-fns";

type BaseItem = {
	localDateStr: string
}
type BaseItemWithDate = BaseItem & { date: Date };

export function itemsSolvedSinceDaysAgo<T extends { date: Date; }>(
	itemsByDate: T[],
	daysAgo: number,
	opts: { isSorted: boolean; } = { isSorted: false }
): T[] {
	const now = new Date();
	const daysAgoDate = subDays(now, daysAgo);
	if (opts.isSorted) {
		const idx = itemsByDate.findIndex(item => isBefore(item.date, daysAgoDate));
		if (idx <= 0) {
			// no items are older than the given days ago, so all items are within the range
			return itemsByDate;
		}
		return itemsByDate.slice(0, idx);
	} else {
		return itemsByDate.filter(item => isBefore(item.date, daysAgoDate));
	}
}

export function getUniqueDatesFromItems(historyItems: BaseItem[] = []): BaseItemWithDate[] {
	if (!historyItems.length) return [];

	const uniqueDateStrings = [...new Set(
		historyItems.map(item => item.localDateStr)
	)].sort(); // from least to most recent

	return uniqueDateStrings.map(localDateStr => {
		return { localDateStr, date: new Date(localDateStr) };
	})
}

export function getItemsByDate<T extends BaseItem>(historyItems: T[] = []) {
	if (!historyItems.length) return {};

	// TODO: maybe, not as efficient as can be
	const uniqueDates = getUniqueDatesFromItems(historyItems).map(d => d.localDateStr);

	const map: Record<string, T[]> = Object.fromEntries(
		uniqueDates.map(dStr => [dStr, []])
	);

	for (const item of historyItems) {
		const { localDateStr } = item;
		map[localDateStr].push(item);
	}
	return map;
}

export function getDateRange<T extends BaseItemWithDate>(historyItems: T[] = []) {
	if (!historyItems.length) return {
		from: null,
		to: null
	} as const;

	const a = historyItems[0];
	const b = historyItems[historyItems.length - 1];

	const from = a.date < b.date ? a : b;
	const to = from === a ? b : a;
	return {
		from: from.localDateStr,
		to: to.localDateStr
	}
}