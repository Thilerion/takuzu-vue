const pwmSettings = {
	1: [5, 1],
	2: [10, 1],
};

export const lengthToPwmPattern = (length, intensity = 2) => {
	if (intensity === 0) return 0;
	if (intensity === 3) return length;

	if (length < 180) {
		if (intensity === 1) {
			return length * 0.67;
		} else if (intensity === 2) {
			return length * 0.85;
		}
	} else {
		let total = 0;
		let pattern = [];
		const increase = intensity === 1 ? 5 : 15;
		let nextDelay = false;
		while (total < length) {
			let nextValue = nextDelay ? 1 : increase;
			pattern.push(nextValue);
			nextDelay = !nextDelay;
			total += nextValue;
		}
		return pattern;
	}
}