import { trueResult } from '@/services/recap-message/helpers';
import * as recapFn from '@/services/recap-message/recap-message-types.js';
import { beforeAll, describe, expect, test } from 'vitest';

describe('recap generator functions', () => {
	let falseResult;
	beforeAll(() => {
		falseResult = { result: false };
	})

	test('firstSolvedTotal', () => {
		expect(recapFn.firstSolvedTotal({
			totalSolved: 0
		})).toEqual(falseResult);

		expect(recapFn.firstSolvedTotal({
			totalSolved: 1
		})).toEqual(trueResult({ totalSolved: 1 }));

		expect(recapFn.firstSolvedTotal({
			totalSolved: 2
		})).toEqual(falseResult);
	})

	describe('hardestPuzzleSolved', () => {
		test('when not first solved with config', () => {
			expect(recapFn.hardestPuzzleSolved({
				isFirstPuzzleSolvedWithPuzzleConfig: false
			})).toEqual(falseResult);
		})

		test.todo('true when first time playing a higher difficulty');
		test.todo('true when first playing the highest difficulty on a larger board');
		test.todo('false when playing the highest difficulty on a smaller board');
	})
})