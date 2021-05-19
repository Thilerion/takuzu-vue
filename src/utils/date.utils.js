export const isSameDay = (dateA, dateB) => {
	return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
}

export const getNextDay = date => {
	const nextDay = new Date(date);
	nextDay.setDate(nextDay.getDate() + 1);
	return nextDay;
}

export const isNextDay = (dateA, dateB) => {
	const nextDay = getNextDay(dateA);
	return isSameDay(dateB, nextDay);
}

export const formatBasicDDMMYYYY = (date) => {
	return [
		date.getDate(),
		date.getMonth() + 1,
		date.getFullYear()
	].join('-');
}

export const timeFormatter = (formatOptions) => {
	const {
		padMinutes = true,
		msPrecision = null,
	} = formatOptions;

	const padLeft = (num) => `0${num}`.slice(-2);

	return (timestampMS = 0) => {
		const fullSeconds = Math.floor(timestampMS / 1000);

		const seconds = padLeft(Math.floor(fullSeconds % 60));
		let minutes = Math.floor(fullSeconds / 60);
		if (padMinutes) minutes = padLeft(minutes);

		let str = `${minutes}:${seconds}`;

		if (msPrecision) {
			const precisionDivider = 1000 / msPrecision;
			let remainingMs = timestampMS - (fullSeconds * 1000);
			let msToPrecision = Math.floor(remainingMs / precisionDivider);
			str += `.${msToPrecision}`;
		}
		return str;
	}
}