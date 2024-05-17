import { isInTop5PercentOfTimes } from "@/features/recap/services/message-conditions/rank.condition.js"

describe('isInTop5PercentOfTimes', () => {
	it('returns false if amount solved is less than 20', () => {
		expect(isInTop5PercentOfTimes({
			getNumSolvedWithConfig: () => 19,
			puzzleTimes: { sortedTimes: Array(100).fill(10) },
			getTimeElapsed: () => 10
		})).toEqual({ success: false });
	})

	it('returns false if time is not found in list of times', () => {
		const result = isInTop5PercentOfTimes({
			getNumSolvedWithConfig: () => 100,
			puzzleTimes: { sortedTimes: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
			getTimeElapsed: () => 1.1
		})
		expect(result).toEqual({ success: false });
	})

	it('succeeds when time is in top 5% of times', () => {
		const sortedTimes = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
		const result = isInTop5PercentOfTimes({
			getNumSolvedWithConfig: () => 100,
			puzzleTimes: { sortedTimes },
			getTimeElapsed: () => 2
		})
		expect(result.success).toBe(true);
		expect(result.data!.rank).toBeLessThanOrEqual(5);
		expect(result.data).toMatchInlineSnapshot(`
			{
			  "rank": 5,
			}
		`);
	})

	it('returns false when time is not in top 5% of times', () => {
		const sortedTimes = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
		const result = isInTop5PercentOfTimes({
			getNumSolvedWithConfig: () => 100,
			puzzleTimes: { sortedTimes },
			getTimeElapsed: () => 3
		})
		expect(result).toEqual({ success: false });
	})

})