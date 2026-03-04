export interface TimeoutChecker {
	readonly timeoutMs: number;
	isTimedOut: () => boolean;
	reset: () => void;
}

export function createTimeoutChecker(timeoutMs: number): TimeoutChecker {
	if (typeof timeoutMs !== 'number' || timeoutMs <= 0) {
		throw new Error('Timeout must be a positive number');
	}

	let startTime = performance.now();
	let endTime = startTime + timeoutMs;

	const isTimedOut = () => performance.now() >= endTime;
	const reset = () => {
		startTime = performance.now();
		endTime = startTime + timeoutMs;
	};

	return {
		timeoutMs,
		isTimedOut,
		reset,
	};
}
