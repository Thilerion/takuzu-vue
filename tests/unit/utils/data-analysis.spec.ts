import { calculateEma } from "@/utils/data-analysis.utils.js";

describe('data analysis utils', () => {
	describe('exponential moving average', () => {
		it('returns the correct final value for a series of values', () => {
			const valuesA = [100, 110, 105, 115, 120, 130, 140, 150, 145, 155];
			const emaA = calculateEma(valuesA, 12);
			expect(emaA).toBeCloseTo(128.75);

			// from example at https://www.npmjs.com/package/exponential-moving-average
			const valuesB = [
				22.27,
				22.19,
				22.08,
				22.17,
				22.18,
				22.13,
				22.23,
				22.43,
				22.24,
				22.29,
				22.15,
				22.39,
				22.38,
				22.61,
				23.36,
				24.05,
				23.75,
				23.83,
				23.95,
				23.63,
				23.82,
				23.87,
				23.65,
				23.19,
				23.10,
				23.33,
				22.68,
				23.10,
				22.40,
				22.17,
			];
			const emaB = calculateEma(valuesB, 10);
			expect(emaB).toBeCloseTo(22.92);
		})
	})
})