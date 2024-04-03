import { PersonalBestGameEndStats } from "@/services/puzzle-recap/GameEndStats.js"
import { isSolvedWithLargeTimeRecordImprovement, isSolvedWithTimeRecordImprovement } from "@/services/puzzle-recap/message-conditions/time-record.condition.js"

describe('time-record.condition', () => {
	describe('isSolvedWithLargeTimeRecordImprovement', () => {

		it('returns false if not a time record', () => {
			expect(isSolvedWithLargeTimeRecordImprovement({
				personalBest: {
					isTimeRecord: () => false
				} as PersonalBestGameEndStats
			})).toEqual({ success: false });
		})

		it('returns false when previousBest is null; this is the first time solving this puzzle type', () => {
			const best = { timeElapsed: 1000, id: 1 };
			const pb = new PersonalBestGameEndStats({
				current: best,
				best,
				previousBest: null
			});
			expect(isSolvedWithLargeTimeRecordImprovement({ personalBest: pb })).toEqual({ success: false });
		})

		it('returns false when there is no time improvement', () => {
			const best = { timeElapsed: 1000, id: 1 };
			const pb = new PersonalBestGameEndStats({
				current: { timeElapsed: 1000, id: 2 }, // different entry, same time
				best,
				previousBest: best
			});
			expect(isSolvedWithLargeTimeRecordImprovement({ personalBest: pb })).toEqual({ success: false });
		})

		it('fails when the time set is a time record, but by a small margin', () => {
			const previousBest = { timeElapsed: 10_000, id: 1 };
			const expected = { success: false };

			const best1 = { timeElapsed: 9_999, id: 2 };
			const pb = new PersonalBestGameEndStats({
				current: best1, // 1ms less
				best: best1,
				previousBest
			});
			expect(isSolvedWithLargeTimeRecordImprovement({ personalBest: pb })).toEqual(expected);

			const best1000 = { timeElapsed: 9_000, id: 3 }; // 1000ms or +-10%
			const pb2 = new PersonalBestGameEndStats({
				current: best1000,
				best: best1000,
				previousBest
			});
			expect(isSolvedWithLargeTimeRecordImprovement({ personalBest: pb2 })).toEqual(expected);
		})

		it('succeeds when time improvement is 30+ seconds, even though percentage < 0.35', () => {
			const best = { timeElapsed: 100_000, id: 2 };
			const previousBest = { timeElapsed: 130_000, id: 1 };
			const pb = new PersonalBestGameEndStats({
				current: best,
				best,
				previousBest
			});
			const result = isSolvedWithLargeTimeRecordImprovement({ personalBest: pb });
			expect(result.success).toBe(true);
			expect(result.data!.percentageFaster).toBeLessThan(0.35);
		})
		it('succeeds when percentage improvement is 35%+, even though time improvement < 30s', () => {
			const timeA = 20_000;
			const timeB = 12_000; // 8 seconds, but more than 35%
			const pb = new PersonalBestGameEndStats({
				current: { timeElapsed: timeB, id: 2 },
				best: { timeElapsed: timeB, id: 2 },
				previousBest: { timeElapsed: timeA, id: 1 }
			});
			const result = isSolvedWithLargeTimeRecordImprovement({ personalBest: pb });
			expect(result.success).toBe(true);
			expect(result.data!.percentageFaster).toBeGreaterThan(0.35);
		})

	})

	describe('isSolvedWithTimeRecordImprovement', () => {

		it('returns false if not a time record', () => {
			expect(isSolvedWithTimeRecordImprovement({
				personalBest: {
					isTimeRecord: () => false
				} as PersonalBestGameEndStats
			})).toEqual({ success: false });
		})

		it('returns false when previousBest is null; this is the first time solving this puzzle type', () => {
			const best = { timeElapsed: 1000, id: 1 };
			const pb = new PersonalBestGameEndStats({
				current: best,
				best,
				previousBest: null
			});
			expect(isSolvedWithTimeRecordImprovement({ personalBest: pb })).toEqual({ success: false });
		})

		it('returns false when there is no time improvement', () => {
			const best = { timeElapsed: 1000, id: 1 };
			const pb = new PersonalBestGameEndStats({
				current: { timeElapsed: 1000, id: 2 }, // different entry, same time
				best,
				previousBest: best
			});
			expect(isSolvedWithTimeRecordImprovement({ personalBest: pb })).toEqual({ success: false });
		})

		it('succeeds when there is a time improvement', () => {
			const best = { timeElapsed: 999, id: 2 };
			const previousBest = { timeElapsed: 1000, id: 1 };
			const pb = new PersonalBestGameEndStats({
				current: best, // 1ms less
				best,
				previousBest
			});
			expect(isSolvedWithTimeRecordImprovement({ personalBest: pb })).toEqual({
				success: true,
				data: { timeImprovement: 1 }
			});
		})

	})

})