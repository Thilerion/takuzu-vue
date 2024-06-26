import type { DimensionStr } from "@/lib/types";
import { timeFormatter } from "@/utils/date.utils";

export function getPercentageSlower(faster: number, slower: number): number {
	const slowerSpeed = 1 / slower;
	const fasterSpeed = 1 / faster;
	return (fasterSpeed - slowerSpeed) / slowerSpeed;
}
export function getPercentageFaster(fromSlower: number, toFaster: number): number {
	if (fromSlower < toFaster) {
		throw new Error('Should only use "getPercentageFaster" if the "to" value is smaller (thus faster) than the "from" value.');
	} else if (fromSlower === toFaster) {
		return 0;
	}
	const timeDiff = fromSlower - toFaster;
	return timeDiff / fromSlower;
}

type FormatPercentageOpts = {
	locale?: string,
	maxDigits?: number
}
export const formatPercentage = (value: number, { maxDigits = 0, locale }: FormatPercentageOpts = {}) => {
	const opts = {
		style: 'percent',
		minimumFractionDigits: 0,
		maximumFractionDigits: maxDigits
	}
	return new Intl.NumberFormat(locale, opts).format(value);
}

export const asDimensionsStr = (width: number, height: number): DimensionStr => `${width}x${height}`;

export const msToMinSec = timeFormatter({ padMinutes: true });
export const msToSec = (ms: number) => {
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
export function isMultipleOf(value = 0, multipleOf = 5): boolean {
	return value > 0 && value % multipleOf === 0;
}

export function isCurrentlyMorning() {
	const hours = new Date().getHours();
	return (hours >= 5 && hours < 12);
}