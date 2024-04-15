const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
// const DAY = 24 * HOUR;

const getSeconds = (ms: number) => {
	return Math.floor(ms / SECOND);
}
const getNormalizedSeconds = (ms: number) => {
	return getSeconds(ms) % 60;
}
const getMinutes = (ms: number) => {
	return Math.floor(ms / MINUTE);
}
const getNormalizedMinutes = (ms: number) => {
	return getMinutes(ms) % 60;
}
const getHours = (ms: number) => {
	return Math.floor(ms / HOUR);
}
// const getNormalizedHours = (ms: number) => getHours(ms) % 24;

const durationInMinutesSeconds = (baseMs: number) => {
	const remainderMs = baseMs % 1000;
	const ms = Math.floor(baseMs - remainderMs);

	const seconds = getNormalizedSeconds(ms);
	const minutes = getMinutes(ms);
	return { minutes, seconds, remainderMs };
}
const durationInHoursMinutesSeconds = (baseMs: number) => {
	const remainderMs = baseMs % 1000;
	const ms = Math.floor(baseMs - remainderMs);

	const seconds = getNormalizedSeconds(ms);
	const minutes = getNormalizedMinutes(ms);
	const hours = getHours(ms);
	return { hours, minutes, seconds, remainderMs };
}

export const formatDurationHHMMSS = (ms: number, { 
	padFirst = true,
	emptyHours = true
} = {}) => {
	const { hours, minutes, seconds } = durationInHoursMinutesSeconds(ms);

	if (hours < 1 && !emptyHours) {
		return [
			`${minutes}`.padStart(2, '0'),
			`${seconds}`.padStart(2, '0')
		].join(':');
	}

	return [
		`${hours}`.padStart(padFirst ? 2 : 1, '0'),
		`${minutes}`.padStart(2, '0'),
		`${seconds}`.padStart(2, '0')
	].join(':');
}
export const formatDurationMMSSss = (ms: number, {
	padFirst = true
} = {}) => {
	const roundedToHundredths = Math.ceil(ms / 10) * 10;
	const { 
		minutes,
		seconds,
		remainderMs
	} = durationInMinutesSeconds(roundedToHundredths);

	const hundredths = Math.floor(remainderMs / 10);

	const formattedMinutes = `${minutes}`.padStart(padFirst ? 2 : 1, '0');
	const formattedSeconds = `${seconds}`.padStart(2, '0');
	const formattedHundredths = `${hundredths}`.padStart(2, '0');

	return `${formattedMinutes}:${formattedSeconds}.${formattedHundredths}`;
}