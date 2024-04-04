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

	it('succeeds if time is faster than (previous!) average by 45s', () => {
		const resultSuccess = wasSolvedMuchFasterThanAverageTime({
			getNumSolvedWithConfig: () => 100,
			personalBest: {
				isTimeRecord: () => false
			} as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 310_000,
				previousAverage: 345_000,
			}),
			getTimeElapsed: () => 299_999 // >45s faster
		})

		expect(resultSuccess.success).toBe(true);
		const successData = resultSuccess.data!;
		// timeDifference is 45_001, percentageDifference about 15%
		expect(successData).toMatchInlineSnapshot(`
			{
			  "percentageDifference": 0.13043768115942028,
			  "timeDifference": 45001,
			}
		`);

		expect(wasSolvedMuchFasterThanAverageTime({
			getNumSolvedWithConfig: () => 100,
			personalBest: {
				isTimeRecord: () => false
			} as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 310_000,
				previousAverage: 345_000,
			}),
			getTimeElapsed: () => 300_000 // not >45s faster
		})).toEqual({ success: false })
	})

	it('returns false if count is <6', () => {
		expect(wasSolvedMuchFasterThanAverageTime({
			getNumSolvedWithConfig: () => 5,
			personalBest: {
				isTimeRecord: () => false
			} as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 10_000,
				previousAverage: 10_000,
			}),
			getTimeElapsed: () => 1
		})).toEqual({ success: false })
	})

	it('succeeds if time is faster than previous average by LESS THAN 45s, but with a large percentage difference', () => {
		const result = wasSolvedMuchFasterThanAverageTime({
			getNumSolvedWithConfig: () => 100,
			personalBest: {
				isTimeRecord: () => false
			} as PersonalBestGameEndStats,
			averageTimes: new AverageTimeGameEndStats({
				average: 100_000,
				previousAverage: 100_000,
			}),
			getTimeElapsed: () => 65_000 // 35s faster
		})
		expect(result.success).toBe(true);
		expect(result.data).toMatchInlineSnapshot(`
			{
			  "percentageDifference": 0.35,
			  "timeDifference": 35000,
			}
		`);
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