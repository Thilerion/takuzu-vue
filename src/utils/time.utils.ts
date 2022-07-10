export const padLeft = (num: number | `${number}`, n = 2, value = '0') => `${num}`.padStart(n, value);

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;

export const parseTimeMinSec = (timestampMS: number) => {
	let rem = timestampMS;
	const ms = rem % 1000;
	rem -= ms;
	rem /= 1000;

	const seconds = rem % 60;
	rem -= seconds;
	rem /= 60;

	return {
		minutes: rem,
		seconds,
		ms
	}
}


interface FormatTimeMmSsOpts {
	padMinutes?: boolean,
	ceilAbove?: number
}

export const formatTimeMMSS = (timestampMS: number, {
	padMinutes = true,
	ceilAbove = 499
}: FormatTimeMmSsOpts = {}) => {
	let totalSeconds = timestampMS / 1000;
	const remainingMS = timestampMS % 1000;
	const secondRounding = remainingMS <= ceilAbove ? Math.floor : Math.ceil;
	totalSeconds = secondRounding(totalSeconds);

	const seconds = totalSeconds % 60;
	const minutes = (totalSeconds - seconds) / 60;

	return `${padMinutes ? padLeft(minutes) : minutes}:${padLeft(seconds)}`;
}

export const formatTimeMMSSWithRounding = (ceilAbove: number) => (
	timestampMS: number,
	opts?: Omit<Required<FormatTimeMmSsOpts>, 'ceilAbove'>
) => formatTimeMMSS(timestampMS, {
	...opts,
	ceilAbove,
});