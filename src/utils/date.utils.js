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