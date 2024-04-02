import type { IPuzzleConfigBestAndAverage } from "@/services/puzzle-recap/GameEndStats.js"
import { isSolvedWithLargeTimeRecordImprovement } from "@/services/puzzle-recap/message-conditions/time-record.condition.js"

describe('time-record.condition', () => {
	describe('isSolvedWithLargeTimeRecordImprovement', () => {
		it('fails if not a time record as determined by data', () => {
			// "isTimeRecord" in this object is true if the saved puzzle has an id equal to the fastest puzzle in the storage, so not determined by times
			const bestAndAverage: IPuzzleConfigBestAndAverage = {
				isTimeRecord: false,
				best: 1,
				average: 10,
				previousBest: 1,
				previousAverage: 10,
			}
			const stats = {
				bestAndAverage,
				getTimeElapsed: () => 1,
			}
			const result = isSolvedWithLargeTimeRecordImprovement(stats);
			expect(result).toEqual({ success: false });
		})

		it('fails when previousBest is null; this is the first time solving this puzzle type', () => {
			const bestAndAverage: IPuzzleConfigBestAndAverage = {
				isTimeRecord: true,
				best: 1,
				average: 10,
				previousBest: null,
				previousAverage: null,
			}
			const stats = {
				bestAndAverage,
				getTimeElapsed: () => 1,
			}
			const result = isSolvedWithLargeTimeRecordImprovement(stats);
			expect(result).toEqual({ success: false });
		})

		it('fails when the time set is a time record, but by a small margin', () => {
			const bestAndAverage: IPuzzleConfigBestAndAverage = {
				isTimeRecord: true,
				best: 5000,
				average: 10_000,
				previousBest: 6000,
				previousAverage: 10_001,
			}
			const stats = {
				bestAndAverage,
				getTimeElapsed: () => 5000,
			}
			const result = isSolvedWithLargeTimeRecordImprovement(stats);
			expect(result).toEqual({ success: false });
		})

		it('succeeds when time is more than 10 seconds faster than previous best', () => {
			const bestAndAverage: IPuzzleConfigBestAndAverage = {
				isTimeRecord: true,
				best: 50_000,
				average: 100_000,
				previousBest: 60_001, // 10 seconds slower
				previousAverage: 100_001,
			}
			const stats = {
				bestAndAverage,
				getTimeElapsed: () => 50_000,
			}
			const result = isSolvedWithLargeTimeRecordImprovement(stats);
			expect(result.success).toEqual(true);
			expect(result.data!.percentageFaster).toBeLessThan(0.35); // not due to percentage faster difference
		})

	})
})