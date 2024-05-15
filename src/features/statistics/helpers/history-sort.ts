export type HistorySortBy = 'date' | 'time';
export type HistorySortDir = 'asc' | 'desc';
export type HistorySortSelection = `${HistorySortBy};${HistorySortDir}`;

export function isSortByKey(value: unknown): value is HistorySortBy {
	return typeof value === 'string' && ['date', 'time'].includes(value);
}
export function isSortDir(value: unknown): value is HistorySortDir {
	return typeof value === 'string' && ['asc', 'desc'].includes(value);
}

export function toSortSelection(
	sortBy: HistorySortBy,
	sortDir: HistorySortDir
): HistorySortSelection {
	return `${sortBy};${sortDir}`;
}

export function parseSortSelection(
	sortSelection: string
): [HistorySortBy, HistorySortDir] {
	const [sortBy, sortDir] = sortSelection.split(';') as [HistorySortBy, HistorySortDir];
	return [sortBy, sortDir];
}

type HistorySortableItem = { timeElapsed: number, timestamp: number };
type HistorySortFn = (
	a: HistorySortableItem,
	b: HistorySortableItem
) => number;

export function getSortFn(
	sortType: HistorySortSelection
): HistorySortFn {
	switch (sortType) {
		case 'date;desc': /* newestFirst */
			return (a, b) => b.timestamp - a.timestamp;
		case 'date;asc': /* oldestFirst */
			return (a, b) => a.timestamp - b.timestamp;
		case 'time;asc': /* fastestFirst */
			return (a, b) => a.timeElapsed - b.timeElapsed;
		case 'time;desc': /* slowestFirst */
			return (a, b) => b.timeElapsed - a.timeElapsed;
		default: {
			const x: never = sortType;
			console.error(`Unknown sort type: ${x}`);
			return (a, b) => b.timestamp - a.timestamp;
		}			
	}
}