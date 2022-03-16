export function getUniqueDatesFromItems(historyItems = []) {
	if (!historyItems.length) return [];

	const uniqueDateStrings = [...new Set(
		historyItems.map(item => item.dateStr)
	)].sort(); // from least to most recent

	return uniqueDateStrings.map(dateStr => {
		return { dateStr, date: new Date(dateStr) };
	})
}