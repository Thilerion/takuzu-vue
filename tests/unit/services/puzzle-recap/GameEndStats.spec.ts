import { PersonalBestGameEndStats } from "@/features/recap/services/GameEndStats.js"

describe('PersonalBestGameEndStats class', () => {
	describe('isTimeRecord()', () => {
		it('is false if the entry with the fastest time is not the same as the current entry', () => {
			const dataWithCurrentId = {
				current: {
					timeElapsed: 10, // is faster, but has an id that is not the same as the best (for testing purposes, this shouldnt actually happen)
					id: 1
				},
				best: {
					timeElapsed: 11,
					id: 2,
				},
				previousBest: {
					timeElapsed: 11,
					id: 2,
				}
			}
			const statsA = new PersonalBestGameEndStats(dataWithCurrentId);
			expect(statsA.isTimeRecord()).toBe(false);

			const dataWithoutCurrentId = {
				current: {
					timeElapsed: 9, // is faster, potentially time record, but no id so not marked as best
				},
				best: {
					timeElapsed: 10,
					id: 1,
				},
				previousBest: {
					timeElapsed: 10,
					id: 1,
				}
			}
			const statsB = new PersonalBestGameEndStats(dataWithoutCurrentId);
			expect(statsB.isTimeRecord()).toBe(false);
		})

		it('is always true if there is no previousBest item (due to this being the first solved puzzle potentially)', () => {
			const current = { timeElapsed: 10, id: 1 };
			const stats = new PersonalBestGameEndStats({
				current,
				best: current,
				previousBest: null
			})
			expect(stats.isTimeRecord()).toBe(true);
		})

		it('is true if current.timeElapsed is less than previousBest.timeElapsed', () => {
			const current = { timeElapsed: 10, id: 10 };
			const stats = new PersonalBestGameEndStats({
				current,
				best: current,
				previousBest: {
					timeElapsed: 11,
					id: 9
				}
			})
			expect(stats.isTimeRecord()).toBe(true);
		})

		it('is false if current.timeElapsed is equal to or lower than previousBest.timeElapsed', () => {
			const current = { timeElapsed: 10, id: 10 };
			const stats = new PersonalBestGameEndStats({
				current,
				best: current,
				previousBest: {
					timeElapsed: current.timeElapsed,
					id: 9
				}
			})
			expect(stats.isTimeRecord()).toBe(false);
		})
	})

	describe('getTimeImprovement()', () => {
		it('returns how much faster the current time is compared to the previous best', () => {
			const best = { timeElapsed: 10_000, id: 10 }; // 1500 faster
			const previous = { timeElapsed: 11_500, id: 9 };
			const stats = new PersonalBestGameEndStats({
				current: best,
				best,
				previousBest: previous
			})
			expect(stats.getTimeImprovement()).toBe(1_500);
		})
		it('returns how much slower the current time is compared to the best, if this is not a time record', () => {
			const current = { timeElapsed: 11_500, id: 10 }; // 1500 slower
			const best = { timeElapsed: 10_000, id: 9 };
			const stats = new PersonalBestGameEndStats({
				current,
				best,
				previousBest: best // current is not a time record, so previousBest === best
			})
			expect(stats.getTimeImprovement()).toBe(-1_500);
		})
		it('returns null if there is no "previousBest"', () => {
			const current = { timeElapsed: 11_500, id: 10 };
			const stats = new PersonalBestGameEndStats({
				current,
				best: current,
				previousBest: null
			})
			expect(stats.getTimeImprovement()).toBe(null);
		})
	})
	
	describe('getPercentageFasterThanPreviousBest()', () => {
		it('returns null if current time is not the best time', () => {
			const current = { timeElapsed: 11_500, id: 10 };
			const best = { timeElapsed: 10_000, id: 9 };
			const stats = new PersonalBestGameEndStats({
				current,
				best,
				previousBest: best
			})
			expect(stats.getPercentageFasterThanPreviousBest()).toBe(null);
		})
		it('returns null if there is no previous best', () => {
			const current = { timeElapsed: 10_000, id: 10 };
			const stats = new PersonalBestGameEndStats({
				current,
				best: current,
				previousBest: null
			})
			expect(stats.getPercentageFasterThanPreviousBest()).toBe(null);
		})
		it('returns how much faster the current time is compared to the previous best', () => {
			const best = { timeElapsed: 80_000, id: 10 }; // 20% faster === 20% less time taken
			const previous = { timeElapsed: 100_000, id: 9 };
			const stats = new PersonalBestGameEndStats({
				current: best,
				best,
				previousBest: previous
			})
			expect(stats.getPercentageFasterThanPreviousBest()).toBe(0.2);
		})
	})

	describe.todo('getPercentageOffFromBest()');
	
	describe.todo('getPercentageSlowerThanBest()');

	describe('constructor', () => {

		describe.todo('static .fromItems()');

		it.todo('works even when "previousItems" is empty');
		
		it.todo('throws a recoverable error if "items" is empty');
	})

})