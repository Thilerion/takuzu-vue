import { SimpleBoard } from "@/lib/board/Board.js";
import { ConstraintSolver, type ConstraintSolverOpts } from "@/lib/solvers/constraint-solver/ConstraintSolver.js";
import { applyEliminationConstraint } from "@/lib/solvers/constraint-solver/constraints/EliminationConstraint.js";
import { applyLineBalanceConstraint } from "@/lib/solvers/constraint-solver/constraints/LineBalanceConstraint.js";
import { applyTriplesConstraint } from "@/lib/solvers/constraint-solver/constraints/TriplesConstraint.js";
import { selectCellStrategies, selectValueStrategies } from "@/lib/solvers/constraint-solver/selection/index.js";
import type { BoardExportString } from "@/lib/types.js";

describe('ConstraintSolver', () => {
	describe('with backtracking only', () => {
		const getSolverConf = (max: number = Infinity): ConstraintSolverOpts => ({
			constraints: [],
			maxSolutions: max,
			dfs: {
				enabled: true,
				selectCell: selectCellStrategies.firstEmpty,
				selectValue: selectValueStrategies.leastConstraining,
				timeout: null,
			}
		})

		it('should solve a small puzzle with a single solution', () => {
			const gridArr = [
				'1..1',
				'1...',
				'..0.',
				'....'
			]
			const board = SimpleBoard.fromArrayOfLines(gridArr);
			const result = ConstraintSolver.run(board, getSolverConf());
			expect(result.solutions.length).toBe(1);
			expect(result.solutions[0].grid.map(r => r.join(''))).toEqual([
				'1001',
				'1010',
				'0101',
				'0110'
			])
		})

		it('should not find a solution if the input board does not have a valid solution', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1..1',
				'1..1',
				'....',
				'....'
			])
			const result = ConstraintSolver.run(board, getSolverConf());
			expect(result.solutions.length).toBe(0);
		})

		it('finds multiple solutions if there are multiple valid solutions', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'....',
				'....'
			])
			const result = ConstraintSolver.run(board, getSolverConf());
			expect(result.solutions.length).toBe(4);

			const solutions = result.solutions.map(b => b.export());
			expect(new Set(solutions).size).toBe(4); // all solutions found are unique
		})

		it('stops after reaching maxSolutions, even if there are more to be found', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'....',
				'....'
			])
			expect(ConstraintSolver.run(board, getSolverConf()).numSolutions).toBe(4);

			// has 4 solutions. If maxSolutions is set to 2, the result should have 2 solutions
			const conf = {
				...getSolverConf(),
				maxSolutions: 2
			}
			expect(ConstraintSolver.run(board, conf).numSolutions).toBe(2);
		})
	})

	describe('without backtracking, with specific constraints', () => {
		const getSolverConf = (
			constraintFns: ConstraintSolverOpts['constraints']
		): ConstraintSolverOpts => ({
			constraints: constraintFns,
			maxSolutions: 1,
			dfs: { enabled: false }
		})

		test('should solve a puzzle with triples only', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'0.11.1',
				'0....1',
				'..11..',
				'11..10',
				'.1.1..',
				'1..0.0'
			]); // this board can be solved using just triples strat: pairs/doubles and sandwiches
			const conf = getSolverConf([applyTriplesConstraint]);
			const result = ConstraintSolver.run(board, conf);
			expect(result.solutions).toHaveLength(1);
			expect(result.solutions[0].toBoardString()).toBe([
				'001101',
				'010011',
				'101100',
				'110010',
				'010101',
				'101010'
			].join(''))
		})

		test('should solve a puzzle with line balance only', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'0.00..',
				'..11.1',
				'..0010',
				'.0..00',
				'0.0.01',
				'.0101.'
			]) // board can be solved using just line balance strat
			const conf = getSolverConf([applyLineBalanceConstraint]);
			const result = ConstraintSolver.run(board, conf);
			expect(result.solutions).toHaveLength(1);
			expect(result.solutions[0].toBoardString()).toBe([
				'010011',
				'001101',
				'110010',
				'101100',
				'010101',
				'101010'
			].join(''))
		})

		test('a board that requires the triples technique can not be solved with just line balance', () => {
			const boardRequiresTriples = SimpleBoard.fromArrayOfLines([
				'0.11.1',
				'0....1',
				'..11..',
				'11..10',
				'.1.1..',
				'1..0.0'
			]);

			const confBalanceOnly = getSolverConf([applyLineBalanceConstraint]);
			const confTriplesOnly = getSolverConf([applyTriplesConstraint]);
			const confBoth = getSolverConf([applyTriplesConstraint, applyLineBalanceConstraint]);

			// can be solved with triples technique
			expect(ConstraintSolver.run(boardRequiresTriples, confTriplesOnly)).toMatchObject({
				solvable: true,
				numSolutions: 1,
				solutions: expect.any(Array)
			})
			// cannot be solved with (just) balance technique
			expect(ConstraintSolver.run(boardRequiresTriples, confBalanceOnly)).toMatchInlineSnapshot(`
				{
				  "numSolutions": 0,
				  "solutions": [],
				  "solvable": false,
				}
			`);
			// but can be solved with both again
			expect(ConstraintSolver.run(boardRequiresTriples, confBoth)).toMatchObject({
				solvable: true,
				numSolutions: 1,
				solutions: expect.any(Array)
			})
		})

		test('a board that requires line balance can not be solved with just triples', () => {
			const boardRequiresBalance = SimpleBoard.fromArrayOfLines([
				'0.00..',
				'..11.1',
				'..0010',
				'.0..00',
				'0.0.01',
				'.0101.'
			])
			const confBalanceOnly = getSolverConf([applyLineBalanceConstraint]);
			const confTriplesOnly = getSolverConf([applyTriplesConstraint]);
			const confBoth = getSolverConf([applyTriplesConstraint, applyLineBalanceConstraint]);

			// can be solved with balance technique
			expect(ConstraintSolver.run(boardRequiresBalance, confBalanceOnly).solutions).toHaveLength(1);
			// cannot be solved with (just) triples technique
			expect(ConstraintSolver.run(boardRequiresBalance, confTriplesOnly).solutions).toHaveLength(0);
			// but can be solved with both again
			expect(ConstraintSolver.run(boardRequiresBalance, confBoth).solutions).toHaveLength(1);
		})

		test('a board that requires difficulty techniques cannot be solved with just triples or balance', () => {
			// these boards require an elim-1-2 technique to be solved
			const boardOdd = SimpleBoard.import('7x7;.1...............0..01......0...0..101....0.....0' as BoardExportString);
			const boardRect = SimpleBoard.import('6x10;.1....01...1101010100101011010.1001.10.10.0....10....01..0.1' as BoardExportString);

			const confEasy = getSolverConf([applyTriplesConstraint, applyLineBalanceConstraint]);
			const confWithElim12 = getSolverConf([
				applyTriplesConstraint, applyLineBalanceConstraint,
				(board: SimpleBoard) => applyEliminationConstraint(board, { leastRemainingRange: [1, 2], singleAction: true })
			])

			// can be solved with elim-1-2 technique
			expect(ConstraintSolver.run(boardOdd, confWithElim12).solutions).toHaveLength(1);
			expect(ConstraintSolver.run(boardRect, confWithElim12).solutions).toHaveLength(1);

			// cannot be solved with (just) triples or balance techniques
			expect(ConstraintSolver.run(boardOdd, confEasy).solutions).toHaveLength(0);
			expect(ConstraintSolver.run(boardRect, confEasy).solutions).toHaveLength(0);
		})
	})

	describe('with backtracking, and timeout enabled', () => {
		it('stops after timeout is reached, even when there are more solutions to be found', () => {
			const board = SimpleBoard.empty(6, 6); // has a lot of solutions
			const getConf = (timeout: number | null): ConstraintSolverOpts => ({
				constraints: [],
				maxSolutions: 500,
				dfs: {
					enabled: true,
					selectCell: selectCellStrategies.firstEmpty,
					selectValue: selectValueStrategies.leastConstraining,
					timeout
				}
			})
			// without timeout, finds all solutions (or up to 500)
			const startA = performance.now();
			expect(ConstraintSolver.run(board, getConf(10_000)).numSolutions).toBe(500);
			const durationA = performance.now() - startA;
			expect(durationA).toBeGreaterThan(100); // took 470ms on my machine, so expect it to be at least 100ms


			// with short timeout, will not find all (or 500) solutions
			const start = performance.now();
			expect(ConstraintSolver.run(board, getConf(10)).numSolutions).toBeLessThan(50);
			const duration = performance.now() - start;
			expect(duration).toBeLessThan(20);
		})

		it('throws an error if timeout is reached, and throwAfterTimeout is enabled', () => {
			const conf: ConstraintSolverOpts = {
				constraints: [],
				maxSolutions: 500,
				dfs: {
					enabled: true,
					selectCell: selectCellStrategies.firstEmpty,
					selectValue: selectValueStrategies.leastConstraining,
					timeout: 10,
					throwAfterTimeout: true
				}
			}
			const board = SimpleBoard.empty(6, 6);
			expect(() => ConstraintSolver.run(board, conf)).toThrowErrorMatchingInlineSnapshot(`[Error: Stopped ConstraintSolver due to timeout.]`);
		})
	})

	describe('finding all possible solutions to a puzzle (long test cases)', () => {
		test('finds all solutions for an empty 4x4 board, and there are no duplicate solutions', () => {
			const board = SimpleBoard.empty(4, 4);
			const result = ConstraintSolver.run(board, { maxSolutions: Infinity, dfs: {
				enabled: true,
				timeout: null
			} });
			// 6 different rows in a 4x4 board, each first row generates 12 possible end solutions, so 6*12 = 72
			expect(result.numSolutions).toBe(72);

			// all found solutions are unique
			const solutions = result.solutions.map(b => b.export());
			const uniqueSolutions = new Set(solutions);
			expect(uniqueSolutions.size).toBe(solutions.length);
		})
	})
})