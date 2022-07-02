export const asPercentage = (value: number) => value.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatOrdinal = (value: number, locale = 'en-US') => {
	const pr = new Intl.PluralRules(locale, { type: 'ordinal' });

	const suffixes = new Map([
		['one',   'st'],
		['two',   'nd'],
		['few',   'rd'],
		['other', 'th'],
	]);

	const rule = pr.select(value);
	const suffix = suffixes.get(rule);
	return `${value}${suffix}`;
}