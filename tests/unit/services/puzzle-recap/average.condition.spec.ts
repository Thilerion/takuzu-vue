import { AverageTimeGameEndStats, type PersonalBestGameEndStats } from "@/services/puzzle-recap/GameEndStats.js"
import { wasSolvedFasterThanAverageTime, wasSolvedMuchFasterThanAverageTime } from "@/services/puzzle-recap/message-conditions/average.condition.js"

describe('wasSolvedFasterThanAverageTime', () => {
	it('returns false if count is <4', () => {
		expect(wasSolvedFasterThanAverageTime({
			getNumSolvedWithConfig: () => 3,
			personalBest: {} as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 1000,
				previousAverage: 1000,
			}),
			getTimeElapsed: () => 1
		})).toEqual({ success: false })
	})

	it('returns false if time record', () => {
		expect(wasSolvedFasterThanAverageTime({
			getNumSolvedWithConfig: () => 100,
			personalBest: { isTimeRecord: () => true } as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 1000,
				previousAverage: 1000,
			}),
			getTimeElapsed: () => 1
		})).toEqual({ success: false })
	})

	it('returns false if time is slower than or equal to average', () => {
		expect(wasSolvedFasterThanAverageTime({
			getNumSolvedWithConfig: () => 100,
			personalBest: { isTimeRecord: () => false } as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 1000,
				previousAverage: 1000,
			}),
			getTimeElapsed: () => 1000 // equal to average
		})).toEqual({ success: false })

		expect(wasSolvedFasterThanAverageTime({
			getNumSolvedWithConfig: () => 100,
			personalBest: { isTimeRecord: () => false } as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 1000,
				previousAverage: 1000,
			}),
			getTimeElapsed: () => 1001 // slower than average
		})).toEqual({ success: false })
	})

	it('succeeds if time is faster than (previous!) average', () => {
		expect(wasSolvedFasterThanAverageTime({
			getNumSolvedWithConfig: () => 100,
			personalBest: { isTimeRecord: () => false } as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 999,
				previousAverage: 1000,
			}),
			getTimeElapsed: () => 997
		})).toEqual({
			success: true,
			data: { timeDifference: 3 } // compared to previousAverage
		})
	})

})

describe('wasSolvedMuchFasterThanAverageTime', () => {

	it.todo('succeeds if time is faster than (previous!) average by 45s', () => {
		
	})
	it.todo('other tests with success');

	it('returns false if count is <6', () => {
		expect(wasSolvedMuchFasterThanAverageTime({
			getNumSolvedWithConfig: () => 5,
			personalBest: {
				isTimeRecord: () => false,
				best: {
					timeElapsed: 290_000
				}
			} as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 10_000,
				previousAverage: 10_000,
			}),
			getTimeElapsed: () => 1
		})).toEqual({ success: false })
	})

	it('returns false if time record', () => {
		const result = wasSolvedMuchFasterThanAverageTime({
			getNumSolvedWithConfig: () => 100,
			personalBest: {
				isTimeRecord: () => true
			} as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 100_000,
				previousAverage: 100_000,
			}),
			getTimeElapsed: () => 25_000 // 35s faster
		});
		expect(result.success).toBe(false);
	})

})