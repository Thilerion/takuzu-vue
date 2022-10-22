import type { DifficultyKey } from "@/lib/types";
import { timeFormatter } from "@/utils/date.utils";
import { DIFFICULTY_LABELS } from "@/config";

export const recapMsToMinSec = timeFormatter({ padMinutes: true });
export const recapMsToSec = (ms: number) => {
	if (ms <= 100) {
		return Math.round(ms) / 1000;
	} else if (ms < 1020) {
		return (Math.round(ms / 10) / 100).toFixed(2);
	} else if (ms < 9500) {
		return (Math.round(ms / 100) / 10).toFixed(1);
	} else {
		return Math.round(ms / 1000);
	}
}

const _percentageFormatters = new Map<number, Intl.NumberFormat>();
export const formatPercentage = (value: number, { maxDigits = 0 } = {}) => {
	if (!_percentageFormatters.has(maxDigits)) {
		const opts: Intl.NumberFormatOptions = {
			style: 'percent',
			minimumFractionDigits: 0,
			maximumFractionDigits: maxDigits
		}
		_percentageFormatters.set(maxDigits, new Intl.NumberFormat(undefined, opts));
	}
	return _percentageFormatters.get(maxDigits)!.format(value);
}

const ordinalEnSuffixes = new Map([
	['one',   'st'],
	['two',   'nd'],
	['few',   'rd'],
	['other', 'th'],
])
const ordinalPluralEnFormatter = new Intl.PluralRules('en-US', { type: 'ordinal' });
export const formatOrdinal = (value: number) => {
	const rule = ordinalPluralEnFormatter.select(value);
	const suffix = ordinalEnSuffixes.get(rule);
	return `${value}${suffix}`;
}

export const formatDifficultyLabel = (difficultyStars: DifficultyKey) => {
	if (!Object.keys(DIFFICULTY_LABELS).includes(String(difficultyStars))) {
		console.warn(`Difficulty rating with "${difficultyStars} stars" has no associated label.`);
		return `${difficultyStars}*`;
	}
	return `${DIFFICULTY_LABELS[difficultyStars]}`; 
}