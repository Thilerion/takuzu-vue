import type { IHistoryTotals } from "@/features/recap/services/GameEndStats.js";
import { isFirstEverSolved, isFirstOfDifficultySolved, isFirstSolvedWithPuzzleConfig, isFirstWithDimensionsSolved, isHardestEverSolved } from "@/features/recap/services/message-conditions/firsts.condition.js";

describe('firsts.condition', () => {
	describe('isFirstEverSolved', () => {
		it('is only successful if solved amount is 1', () => {
			const resultA = isFirstEverSolved({
				totals: {
					amount: 0
				} as IHistoryTotals
			});
			expect(resultA).toEqual({ success: false });
			const resultB = isFirstEverSolved({
				totals: {
					amount: 1
				} as IHistoryTotals
			});
			expect(resultB).toEqual({ success: true, data: { totalSolved: 1 } });
			const resultC = isFirstEverSolved({
				totals: {
					amount: 2
				} as IHistoryTotals
			});
			expect(resultC).toEqual({ success: false });
		})
	})

	describe('isHardestEverSolved', () => {
		it('is only successful if the puzzle is the hardest ever played, and it is the first time playing this puzzle config', () => {
			const resultA = isHardestEverSolved({
				isCurrentPuzzleHardestEverPlayed: () => false,
				isFirstSolvedWithPuzzleConfig: () => false
			});
			expect(resultA).toEqual({ success: false });

			// hardest ever played, but not the first time
			const resultB = isHardestEverSolved({
				isCurrentPuzzleHardestEverPlayed: () => true,
				isFirstSolvedWithPuzzleConfig: () => false
			});
			expect(resultB).toEqual({ success: false });

			// not hardest ever played
			const resultC = isHardestEverSolved({
				isCurrentPuzzleHardestEverPlayed: () => false,
				isFirstSolvedWithPuzzleConfig: () => true
			});
			expect(resultC).toEqual({ success: false });

			// hardest ever played, and first time
			const resultD = isHardestEverSolved({
				isCurrentPuzzleHardestEverPlayed: () => true,
				isFirstSolvedWithPuzzleConfig: () => true
			});
			expect(resultD).toEqual({ success: true, data: null });
		})
	})

	describe('isFirstOfDifficultySolved', () => {
		it('is unsuccessful if not the first time playing this difficulty', () => {
			const result = isFirstOfDifficultySolved({
				isFirstSolvedWithDifficulty: () => false,
				getPuzzleConfig: () => ({ difficulty: 1, width: 1, height: 1 })
			});
			expect(result).toEqual({ success: false });
		})
		it('is successful if it is the first time playing this difficulty', () => {
			const result = isFirstOfDifficultySolved({
				isFirstSolvedWithDifficulty: () => true,
				getPuzzleConfig: () => ({ difficulty: 1, width: 1, height: 1 })
			});
			expect(result).toEqual({ success: true, data: { difficulty: 1 } });
		})
	})

	describe('isFirstWithDimensionsSolved', () => {
		it('is unsuccessful if not the first time playing this size', () => {
			const result = isFirstWithDimensionsSolved({
				isFirstSolvedWithSize: () => false,
				getPuzzleConfig: () => ({ difficulty: 1, width: 1, height: 1 })
			});
			expect(result).toEqual({ success: false });
		})
		it('is successful if it is the first time playing this size', () => {
			const result = isFirstWithDimensionsSolved({
				isFirstSolvedWithSize: () => true,
				getPuzzleConfig: () => ({ difficulty: 1, width: 1, height: 3 })
			});
			expect(result).toEqual({ success: true, data: { width: 1, height: 3 } });
		})
	})

	describe('isFirstSolvedWithPuzzleConfig', () => {
		it('is unsuccessful if not the first time playing this puzzle config', () => {
			const result = isFirstSolvedWithPuzzleConfig({
				isFirstSolvedWithPuzzleConfig: () => false,
				getPuzzleConfig: () => ({ difficulty: 1, width: 1, height: 1 })
			});
			expect(result).toEqual({ success: false });
		})
		it('is successful if it is the first time playing this puzzle config', () => {
			const result = isFirstSolvedWithPuzzleConfig({
				isFirstSolvedWithPuzzleConfig: () => true,
				getPuzzleConfig: () => ({ difficulty: 1, width: 1, height: 3 })
			});
			expect(result).toEqual({ success: true, data: { width: 1, height: 3, difficulty: 1 } });
		})
	})
})