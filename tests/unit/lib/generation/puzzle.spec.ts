import { createPuzzle } from '@/lib/generation/puzzle.js';
import { ConstraintSolver } from '@/lib/solvers/constraint-solver/ConstraintSolver.js';
import { applyLineBalanceConstraintWithOpts } from '@/lib/solvers/constraint-solver/constraints/LineBalanceConstraint.js';
import { applyTriplesConstraintWithOpts } from '@/lib/solvers/constraint-solver/constraints/TriplesConstraint.js';
import seedrandom from 'seedrandom';

describe('createPuzzle', () => {
	const origRandom = Math.random;
	beforeEach(() => {
		Math.random = seedrandom('test', { global: false });
	})
	afterAll(() => {
		Math.random = origRandom;
	})

	it('can generate an easy 6x6 puzzle, solvable with just triples and balance', () => {
		const result = createPuzzle({
			width: 6, height: 6,
			difficulty: 1
		});
		expect(result?.solution.toBoardString()).toMatchInlineSnapshot(`"101100110010011001100101010110001011"`);
		expect(result?.board.toBoardString()).toMatchInlineSnapshot(`".0...01....00........1.10.0....0...."`);

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