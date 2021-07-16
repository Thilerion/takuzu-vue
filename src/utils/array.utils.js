export function groupBy(arr, key, initialMap = {}) {
	return arr.reduce((acc, val) => {
		const keyVal = val[key];
		if (acc[keyVal] == null) acc[keyVal] = [];
		acc[keyVal].push(val);
		return acc;
	}, initialMap);
}