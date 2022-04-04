const IMPOSSIBLE_MAX_TIME = 59 * 60 * 1000; // 59 minutes
const IMPOSSIBLE_MIN_TIME_MAP = new Map();

const quadratic = (a, b, c, x) => a + (b * x) + (c * Math.pow(x, 2));
const _getImpossibleMinTime = ({ a = -1200, b = 180, c = 1 } = {}) => {
	return (numCells) => {
		if (!IMPOSSIBLE_MIN_TIME_MAP.has(numCells)) {
			IMPOSSIBLE_MIN_TIME_MAP.set(numCells, quadratic(a, b, c, numCells));
		}
		return IMPOSSIBLE_MIN_TIME_MAP.get(numCells);
	}
}
const getImpossibleMinTime = _getImpossibleMinTime();

export const isImpossibleTime = (numCells, timeElapsed) => {
	return timeElapsed >= IMPOSSIBLE_MAX_TIME || timeElapsed <= getImpossibleMinTime(numCells);
}

export const itemHasImpossibleTime = (item) => {
	const { width, height, timeElapsed } = item;
	return isImpossibleTime(width * height, timeElapsed);
}