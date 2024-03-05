import type { SupportedLocale } from "./constants.js";

const suffixesEn = new Map([
	['one',   'st'],
	['two',   'nd'],
	['few',   'rd'],
	['other', 'th'],
]);
const suffixesNl = new Map([
	['other', 'e']
]);
const suffixes: Record<SupportedLocale, Map<string, string>> = {
	'en': suffixesEn,
	'nl': suffixesNl
};

export const formatLocaleOrdinal = (value: number, locale: string) => {
	const pr = new Intl.PluralRules(locale, { type: 'ordinal' });
	const rule = pr.select(value);
	const lang = locale.split('-')[0];
	if (!(lang in suffixes)) {
		console.warn(`No ordinal suffixes for locale "${locale}"`);
		return `${value}`;
	}
	const suffix = suffixes[lang as SupportedLocale].get(rule) ?? '';
	return `${value}${suffix}`;
}