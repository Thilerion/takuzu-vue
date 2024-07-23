export interface TimeoutChecker {
	startTime: number;
	endTime: number;
	isTimedOut: () => boolean;
	reset: () => void;
}

/**
 * Creates a timeout checker with the specified duration.
 * @param timeoutMs The timeout duration in milliseconds.
 * @returns An object with the start time and a function to check if the timeout has been reached.
 * @throws {Error} If the provided timeout is not a positive number.
 */
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
	}

    return {
        startTime,
		endTime,
        isTimedOut,
		reset
    };
}