import { createTimeoutChecker } from "@/lib/solvers/logic-solver/helpers/timeout-check.js";

describe('createTimeoutChecker', () => {
	beforeEach(() => {
		// tell vitest we use mocked time
		vi.useFakeTimers()
	})

	afterEach(() => {
		// restoring date after each test run
		vi.useRealTimers()
	})


	it('throws an error if timeout is not a positive number', () => {
		expect(() => createTimeoutChecker(0)).toThrowErrorMatchingInlineSnapshot(`[Error: Timeout must be a positive number]`);
		expect(() => createTimeoutChecker(-1)).toThrowErrorMatchingInlineSnapshot(`[Error: Timeout must be a positive number]`);
	})

	it('returns a timeout checker with the correct properties', () => {
		const timeout = 100;
		const checker = createTimeoutChecker(timeout);

		expect(checker).toEqual({
			timeoutMs: timeout,
			startTime: expect.any(Number),
			endTime: expect.any(Number),
			isTimedOut: expect.any(Function),
			reset: expect.any(Function),
		});
	})

	it('isTimedOut returns true if the timeout has been reached', () => {
		const checker = createTimeoutChecker(1000);
		expect(checker.isTimedOut()).toBe(false);
		vi.advanceTimersByTime(998);
		expect(checker.isTimedOut()).toBe(false);
		vi.advanceTimersByTime(2);
		expect(checker.isTimedOut()).toBe(true);
	})

	it('can be reset', () => {
		const checker = createTimeoutChecker(1000);
		expect(checker.isTimedOut()).toBe(false);
		vi.advanceTimersByTime(900);
		expect(checker.isTimedOut()).toBe(false);
		checker.reset();
		vi.advanceTimersByTime(200);
		expect(checker.isTimedOut()).toBe(false);
		vi.advanceTimersByTime(800);
		expect(checker.isTimedOut()).toBe(true);

		checker.reset();
		expect(checker.isTimedOut()).toBe(false);
		vi.advanceTimersByTime(999);
		expect(checker.isTimedOut()).toBe(false);
		vi.advanceTimersByTime(1);
		expect(checker.isTimedOut()).toBe(true);
	})
})