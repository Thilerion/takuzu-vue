import type { IPuzzleConfigCounts } from "@/features/recap/services/GameEndStats.js";
import { hasSolvedAmountInTotal, hasSolvedAmountToday, hasSolvedAmountWithConfigInTotal, hasSolvedAmountWithConfigToday, isFirstSolvedTodayGeneric, isFirstSolvedTodayInMorning } from "@/features/recap/services/message-conditions/num-plays.condition.js";

describe('num-plays.condition', () => {
	
	describe('hasSolvedAmountInTotal', () => {
		it('should succeed at specific intervals', () => {
			const intervals = [
				// interval of 5 up to 50
				5, 10, 15, 40, 45,
				// interval of 25 up to 150
				75, 100, 125, 150,
				// interval of 50 after 150
				200, 250, 950
			];
			intervals.forEach(totalSolved => {
				const result = hasSolvedAmountInTotal({
					totals: {
						amount: totalSolved
					}
				});
				expect(result).toEqual({ success: true, data: { totalSolved } });
			})
		})
		it('should fail outside the intervals', () => {
			[0, 1, 51, 55, 74, 151, 175].forEach(totalSolved => {
				const result = hasSolvedAmountInTotal({
					totals: {
						amount: totalSolved
					}
				});
				expect(result).toEqual({ success: false });
			})
		})
	})

	describe('hasSolvedAmountToday', () => {
		it('should succeed at milestone intervals of multiples of 5', () => {
			const intervals = [
				// interval of 5
				5, 10, 15, 90, 125, 135, 905
			];
			intervals.forEach(totalSolvedToday => {
				const result = hasSolvedAmountToday({
					totals: {
						today: totalSolvedToday
					}
				});
				expect(result).toEqual({ success: true, data: { totalSolvedToday } });
			})
		})
		it('should fail outside the intervals', () => {
			[0, 1, 51, 74, 151].forEach(totalSolvedToday => {
				const result = hasSolvedAmountToday({
					totals: {
						today: totalSolvedToday
					}
				});
				expect(result).toEqual({ success: false });
			})
		})
	})

	describe('isFirstSolvedToday', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		})
		afterEach(() => {
			vi.useRealTimers();
		})

		describe('in morning', () => {
			it('returns false when not in morning', () => {
				vi.setSystemTime(new Date(2024, 0, 1, 13)); // 1pm
				const result = isFirstSolvedTodayInMorning({
					totals: {
						today: 1,
						amount: 11
					}
				});
				expect(result).toEqual({ success: false });
			})
			it('returns true when not in morning', () => {
				vi.setSystemTime(new Date(2024, 0, 1, 5, 30)); // 5:30 am
				const result = isFirstSolvedTodayInMorning({
					totals: {
						today: 1,
						amount: 11
					}
				});
				expect(result).toEqual({ success: true, data: null });
			})
		})
		describe('in general', () => {
			it('returns false when solved in total is less than 10', () => {
				vi.setSystemTime(new Date(2024, 0, 1, 13)); // 1 pm
				const result = isFirstSolvedTodayGeneric({
					totals: {
						today: 1,
						amount: 9
					}
				});
				expect(result).toEqual({ success: false });
			})

			it('returns false when morning', () => {
				vi.setSystemTime(new Date(2024, 0, 1, 6)); // 6 am
				const result = isFirstSolvedTodayGeneric({
					totals: {
						today: 1,
						amount: 11
					}
				});
				expect(result).toEqual({ success: false });
			})
			it('returns true when not in morning and played today is 1', () => {
				vi.setSystemTime(new Date(2024, 0, 1, 13)); // 1 pm
				const resultSuccess = isFirstSolvedTodayGeneric({
					totals: {
						today: 1,
						amount: 10
					}
				});
				expect(resultSuccess).toEqual({ success: true, data: null });

				const resultFail = isFirstSolvedTodayGeneric({
					totals: {
						today: 2,
						amount: 10
					}
				});
				expect(resultFail).toEqual({ success: false });
			})
		})
	})

	describe('hasSolvedAmountWithConfigInTotal', () => {
		it('should succeed at specific intervals for puzzle config counts', () => {
			const milestones = [
				// Intervals of 10 up to 50
				10, 30, 50,
				// Intervals of 25 from 75 to 250
				75, 100, 125, 150, 175, 200, 225, 250,
				// Intervals of 50 beyond 250
				300, 350, 400, 450, 1000, 1050
			];
			milestones.forEach(count => {
				const currentCounts = { count } as IPuzzleConfigCounts;
				const result = hasSolvedAmountWithConfigInTotal({
					currentCounts,
					getPuzzleConfig: () => ({ width: 8, height: 8, difficulty: 4 })
				});
				expect(result).toEqual({
					success: true,
					data: { count, width: 8, height: 8, difficulty: 4 }
				});
			});
		})

		it('should fail outside the specific intervals for puzzle config counts', () => {
			const nonMilestones = [0, 1, 11, 25, 55, 70, 249, 260, 1025];
			nonMilestones.forEach(count => {
				const currentCounts = { count } as IPuzzleConfigCounts;
				const result = hasSolvedAmountWithConfigInTotal({
					currentCounts,
					getPuzzleConfig: () => ({ width: 8, height: 8, difficulty: 1 })
				});
				expect(result).toEqual({ success: false });
			});
		});
	})

	describe('hasSolvedAmountWithConfigToday', () => {
		it('should succeed at specific intervals for puzzle config counts', () => {
			const milestones = [5, 10, 15, 20, 25, 95, 105, 1005];
			milestones.forEach(today => {
				const currentCounts = { today } as IPuzzleConfigCounts;
				const result = hasSolvedAmountWithConfigToday({
					currentCounts,
					getPuzzleConfig: () => ({ width: 8, height: 8, difficulty: 4 })
				});
				expect(result).toEqual({
					success: true,
					data: { count: today, width: 8, height: 8, difficulty: 4 }
				});
			});
		})

		it('should fail outside the specific intervals for puzzle config counts', () => {
			const nonMilestones = [0, 1, 6, 11, 26, 101];
			nonMilestones.forEach(today => {
				const currentCounts = { today } as IPuzzleConfigCounts;
				const result = hasSolvedAmountWithConfigToday({
					currentCounts,
					getPuzzleConfig: () => ({ width: 8, height: 8, difficulty: 1 })
				});
				expect(result).toEqual({ success: false });
			});
		});
	})

})