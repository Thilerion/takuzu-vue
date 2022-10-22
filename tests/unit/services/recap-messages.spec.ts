import * as recapFn from '@/services/recap-message-ts/recap-applies-fns';
import type { AppliesRequiredData } from '@/services/recap-message-ts/types';
import type { DbHistoryEntry } from '@/services/stats/db/models';
import { beforeAll, describe, expect, test } from 'vitest';
const trueResult = <Ctx extends {}>(c: Ctx) => {
	return {...c, result: true, }
}

describe('recap generator functions', () => {

	test('firstSolvedTotal', () => {
		const resA = recapFn.firstSolvedTotal({ totalSolved: 0 } as any);
		expect(resA).toBe(null);

		const resB = recapFn.firstSolvedTotal({ totalSolved: 1 } as any);
		console.log(resB);
		expect(resB).toEqual(trueResult({ totalSolved: 1}));

		expect(recapFn.firstSolvedTotal({
			totalSolved: 2
		} as any)).toBe(null);
	})

	describe('hardestPuzzleSolved', () => {
		test('when not first solved with config', () => {
			expect(recapFn.hardestPuzzleSolved({
				isFirstSolvedWithPuzzleConfig: false
			} as AppliesRequiredData)).toBe(null);
		})

		test('true when first time playing a higher difficulty', () => {
			const inputA: Partial<AppliesRequiredData> = {
				isFirstSolvedWithPuzzleConfig: true,
				puzzleConfigsPlayed: [
					{ difficulty: 3, width: 10, height: 10, cells: 100 },
					{ difficulty: 3, width: 6, height: 4, cells: 6 * 4 },
					{ difficulty: 4, width: 2, height: 2, cells: 4 },
				],
				lastPuzzleEntry: {
					difficulty: 4,
					width: 2,
					height: 2
				} as DbHistoryEntry
			}
			const inputB = {
				...inputA,
				lastPuzzleEntry: {
					difficulty: 3,
					width: 6,
					height: 4
				}
			}
			expect(recapFn.hardestPuzzleSolved(inputA as AppliesRequiredData)).toEqual(
				{ result: true });

			expect(recapFn.hardestPuzzleSolved(inputB as AppliesRequiredData)).toBe(null);
		})

		test('true when first playing the highest difficulty on a larger board', () => {
			const inputA: Partial<AppliesRequiredData> = {
				isFirstSolvedWithPuzzleConfig: true,
				puzzleConfigsPlayed: [
					{ difficulty: 4, width: 2, height: 2, cells: 4 },
					{ difficulty: 4, width: 3, height: 3, cells: 9 },
				],
				lastPuzzleEntry: {
					difficulty: 4,
					width: 3,
					height: 3
				} as DbHistoryEntry
			}
			const inputB: Partial<AppliesRequiredData> = {
				isFirstSolvedWithPuzzleConfig: true,
				puzzleConfigsPlayed: [
					{ difficulty: 4, width: 2, height: 2, cells: 4 },
					{ difficulty: 4, width: 3, height: 3, cells: 9 },
				],
				lastPuzzleEntry: {
					difficulty: 4,
					width: 2,
					height: 2
				} as DbHistoryEntry
			}

			expect(recapFn.hardestPuzzleSolved(inputA as AppliesRequiredData)).toEqual(
				{ result: true });

			expect(recapFn.hardestPuzzleSolved(inputB as AppliesRequiredData)).toBe(null);
		})

		test('it automatically sorts to find the hardest config', () => {
			const unsorted = [
				{ difficulty: 3, width: 10, height: 10, cells: 100 },
				{ difficulty: 4, width: 4, height: 2, cells: 8 },
				{ difficulty: 1, width: 10, height: 10, cells: 100 },
				{ difficulty: 4, width: 4, height: 1, cells: 4 }
			];
			const puzzleA = {
				difficulty: 4,
				width: 4,
				height: 2
			}
			expect(recapFn.hardestPuzzleSolved({
				isFirstSolvedWithPuzzleConfig: true,
				puzzleConfigsPlayed: unsorted,
				lastPuzzleEntry: puzzleA
			} as AppliesRequiredData)).toEqual({ result: true });
		})

		test('false when playing the highest difficulty on a smaller board', () => {
			const inputA: Partial<AppliesRequiredData> = {
				isFirstSolvedWithPuzzleConfig: true,
				puzzleConfigsPlayed: [
					{ difficulty: 4, width: 3, height: 3, cells: 9 },
					{ difficulty: 4, width: 2, height: 2, cells: 4 },
				],
				lastPuzzleEntry: {
					difficulty: 4,
					width: 2,
					height: 2
				} as DbHistoryEntry
			}

			expect(recapFn.hardestPuzzleSolved(inputA as AppliesRequiredData)).toBe(null);
		})
	})

	describe('firstOfDifficulty', () => {
		test('is true when first of difficulty and NOT first of size', () => {
			expect(recapFn.firstOfDifficulty({
				itemsPlayedWithDifficulty: 1,
				itemsPlayedWithSize: 2,
				lastPuzzleEntry: { difficulty: 1 }
			} as AppliesRequiredData)).toEqual(expect.objectContaining({ result: true }))
		})
		test('is not true when size also has not been played yet', () => {
			expect(recapFn.firstOfDifficulty({
				itemsPlayedWithDifficulty: 1,
				itemsPlayedWithSize: 1,
				lastPuzzleEntry: { difficulty: 1 }
			} as AppliesRequiredData)).toBe(null);
		})
		test('is not true when difficulty has been played before', () => {
			expect(recapFn.firstOfDifficulty({
				itemsPlayedWithDifficulty: 2,
				itemsPlayedWithSize: 1,
				lastPuzzleEntry: { difficulty: 1 }
			} as AppliesRequiredData)).toBe(null);
		})
	})
})