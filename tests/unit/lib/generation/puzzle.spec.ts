import { createPuzzleWithPuzzleConfig, getAttemptQualityStrictness } from '@/lib/generation/puzzle.js';
import { ConstraintSolver } from '@/lib/solvers/constraint-solver/ConstraintSolver.js';
import { applyLineBalanceConstraintWithOpts } from '@/lib/solvers/constraint-solver/constraints/LineBalanceConstraint.js';
import { applyTriplesConstraintWithOpts } from '@/lib/solvers/constraint-solver/constraints/TriplesConstraint.js';
import seedrandom from 'seedrandom';

describe('createPuzzleWithPuzzleConfig', () => {
	const origRandom = Math.random;
	beforeEach(() => {
		Math.random = seedrandom('test', { global: false });
	})
	afterAll(() => {
		Math.random = origRandom;
	})

	it('can generate an easy 6x6 puzzle, solvable with just triples and balance', () => {
		const result = createPuzzleWithPuzzleConfig({
			width: 6, height: 6,
			difficulty: 1
		});
		expect(result?.solution.toBoardString()).toMatchInlineSnapshot(`"100101001011010110110100101001011010"`);
		expect(result?.board.toBoardString()).toMatchInlineSnapshot(`"..........1....11......0......0..0.0"`);

		const solveResult = ConstraintSolver.run(result!.board, {
			maxSolutions: 1,
			dfs: {
				enabled: false
			},
			constraints: [
				applyTriplesConstraintWithOpts({ singleAction: false }),
				applyLineBalanceConstraintWithOpts({ singleAction: false })
			]
		})
		expect(solveResult.solvable).toBe(true);
		expect(solveResult.solutions[0].toBoardString()).toBe(result?.solution.toBoardString());
	})
})

describe('createPuzzle utilities', () => {

	describe('getAttemptQualityStrictness', () => {
		it('returns 0 when timeLeft < 200', () => {
			expect(getAttemptQualityStrictness(10, 9, 199)).toBe(0);
			expect(getAttemptQualityStrictness(10, 9, 200)).not.toBe(0);
		})

		it('throws when attemptsLeft >= maxAttempts, because attemptsLeft does not count the current attempts', () => {
			expect(() => getAttemptQualityStrictness(10, 10, 1000)).toThrow();
		})

		it('returns 1 at first attempts', () => {
			expect(getAttemptQualityStrictness(10, 9, 1000)).toBe(1);
			expect(getAttemptQualityStrictness(10, 8, 1000)).toBeLessThan(1);
		})

		it('caps maxAttempts at 10, and returns 0 at all attempts after 10', () => {
			expect(getAttemptQualityStrictness(20, 9, 1000)).toBe(0);
			expect(getAttemptQualityStrictness(20, 10, 1000)).toBe(0);
			expect(getAttemptQualityStrictness(20, 11, 1000)).not.toBe(0);
		})

		it('returns 0 for the last attempt', () => {
			expect(getAttemptQualityStrictness(10, 0, 1000)).toBe(0);
			expect(getAttemptQualityStrictness(20, 0, 1000)).toBe(0);
			expect(getAttemptQualityStrictness(5, 0, 1000)).toBe(0);
		})

		it('returns a value between 0 and 1 proportionally to the attempts remaining', () => {
			const results: number[] = [];
			for (let i = 0; i < 10; i++) {
				results.push(getAttemptQualityStrictness(10, i, 1000));
			}
			expect(results).toMatchInlineSnapshot(`
				[
				  0,
				  0.11111111111111116,
				  0.2222222222222222,
				  0.33333333333333337,
				  0.4444444444444444,
				  0.5555555555555556,
				  0.6666666666666667,
				  0.7777777777777778,
				  0.8888888888888888,
				  1,
				]
			`);
		})

		it('returns a value between 0 and 1 proportionally to the attempts remaining, capped at 10 attempts', () => {
			const results: number[] = [];
			for (let i = 0; i < 12; i++) {
				results.push(getAttemptQualityStrictness(12, i, 1000));
			}
			expect(results).toMatchInlineSnapshot(`
				[
				  0,
				  0,
				  0,
				  0.11111111111111116,
				  0.2222222222222222,
				  0.33333333333333337,
				  0.4444444444444444,
				  0.5555555555555556,
				  0.6666666666666667,
				  0.7777777777777778,
				  0.8888888888888888,
				  1,
				]
			`);
		})
	})

})