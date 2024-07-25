import { SimpleBoard } from "@/lib/board/Board.js";
import { LogicSolver } from "@/lib/solvers/logic-solver/LogicSolver.js";
import { applyLineBalanceConstraint } from "@/lib/solvers/logic-solver/constraints/LineBalanceConstraint.js";
import { applyTriplesConstraint } from "@/lib/solvers/logic-solver/constraints/TriplesConstraint.js";
import type { SolverResultIncompleteMaxSolutions, SolverResultSolved, SolverResultUnsolvablePartial } from "@/lib/solvers/logic-solver/helpers/SolverResult.js";
import type { ConstraintSolverConstraintsCollection } from "@/lib/solvers/logic-solver/types.js";


describe('LogicSolver', () => {
	describe('DFS only', () => {
		const createDfsSolver = (
			{ maxSolutions = Infinity, timeout = null }: { maxSolutions?: number, timeout?: number | null } = {}
		) => LogicSolver.create({
			constraints: [],
		}, {
			timeout,
			maxSolutions,
		}, {});

		it('should solve a small puzzle with a single solution', () => {
			const gridArr = [
				'1..1',
				'1...',
				'..0.',
				'....'
			]
			const board = SimpleBoard.fromArrayOfLines(gridArr);
			const solver = createDfsSolver();
			const result = solver.solve(board);
			expect(result).toEqual({
				method: 'dfs',
				status: 'solved',
				duration: expect.any(Number),
				solutions: [
					'4x4;1001101001010110'
				]
			})
		})

		it('should not find a solution if the input board does not have a valid solution', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1..1',
				'1..1',
				'....',
				'....'
			])
			const solver = createDfsSolver();
			const result = solver.solve(board);
			// Unsolvable, exhaustive result
			expect(result).toEqual({
				duration: expect.any(Number),
				method: 'dfs',
				status: 'unsolvable',
				exhaustive: true,
			})
		})

		it('finds multiple solutions if there are multiple valid solutions', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'....',
				'....'
			])
			const solver = createDfsSolver();
			const result = solver.solve(board);
			expect(result.status).toBe('solved');
			const solvedResult = result as SolverResultSolved;
			expect(solvedResult.solutions.length).toBe(4);
			expect(new Set(solvedResult.solutions).size).toBe(4); // all solutions found are unique
		})

		it('stops after reaching maxSolutions, even if there are more to be found', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'....',
				'....'
			])
			const solverUncapped = createDfsSolver();
			const resultUncapped = solverUncapped.solve(board);
			expect(resultUncapped).toMatchObject({
				status: 'solved',
			})
			expect((resultUncapped as SolverResultSolved).solutions.length).toBe(4);

			const solverCapped = createDfsSolver({ maxSolutions: 2});
			const result = solverCapped.solve(board);

			// has 4 solutions. If maxSolutions is set to 2, the result should have 2 solutions
			expect(result).toMatchObject({
				method: 'dfs',
				status: 'incomplete',
				exhaustive: false,
				partialSolutions: expect.any(Array),
				reason: 'max_solutions',
			})
			expect((result as SolverResultIncompleteMaxSolutions).partialSolutions.length).toBe(2);
		})

		it('stops after reaching timeout, even if there are more solutions to be found', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'....',
				'....',
				'....',
				'....'
			])
			const solver = createDfsSolver({ maxSolutions: Infinity, timeout: 1 });
			const result = solver.solve(board);
			expect(result).toMatchObject({
				method: 'dfs',
				status: 'incomplete',
				exhaustive: false,
				partialSolutions: expect.any(Array),
				reason: 'timed_out',
			})
		})

		it('should find all solutions for an empty 4x4 board without duplicates', () => {
			const board = SimpleBoard.empty(4, 4);
			const solver = createDfsSolver();
			const result = solver.solve(board) as SolverResultSolved;
			expect(result.status).toBe('solved');

			// 6 different rows in a 4x4 board, each first row generates 12 possible end solutions, so 6*12 = 72
			expect(result.solutions.length).toBe(72);

			// all found solutions are unique
			const uniqueSolutions = new Set(result.solutions);
			expect(uniqueSolutions.size).toBe(72);
		})
	})

	describe('without backtracking, with specific constraints', () => {
		const createSolver = (
			constraintFns: ConstraintSolverConstraintsCollection
		) => LogicSolver.create({
			constraints: constraintFns,
		}, null, {});

		it('should solve a puzzle with triples only', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'0.11.1',
				'0....1',
				'..11..',
				'11..10',
				'.1.1..',
				'1..0.0'
			]); // this board can be solved using just triples strat: pairs/doubles and sandwiches
			const solver = createSolver([applyTriplesConstraint]);
			const result = solver.solve(board);
			expect(result).toEqual({
				method: 'constraints',
				status: 'solved',
				duration: expect.any(Number),
				solutions: ['6x6;001101010011101100110010010101101010']
			})
			const solutions = (result as SolverResultSolved).solutions;
			expect(solutions).toHaveLength(1);
		})

		it('should solve a puzzle with line balance only', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'0.00..',
				'..11.1',
				'..0010',
				'.0..00',
				'0.0.01',
				'.0101.'
			]) // board can be solved using just line balance strat
			const solver = createSolver([applyLineBalanceConstraint]);
			const result = solver.solve(board);
			const expectedSolution = `${[
				'6x6;010011',
				'001101',
				'110010',
				'101100',
				'010101',
				'101010'
			].join('')}`;
			expect(result).toEqual({
				method: 'constraints',
				status: 'solved',
				duration: expect.any(Number),
				solutions: [expectedSolution]
			})
			const solutions = (result as SolverResultSolved).solutions;
			expect(solutions).toHaveLength(1);
		})

		it('cannot solve a puzzle with line balance if it requires triples', () => {
			const boardRequiresTriples = SimpleBoard.fromArrayOfLines([
				'0.11.1',
				'0....1',
				'..11..',
				'11..10',
				'.1.1..',
				'1..0.0'
			]);
			const boardExport = boardRequiresTriples.export();

			const solverTriplesOnly = createSolver([applyTriplesConstraint]);
			const solverBalanceOnly = createSolver([applyLineBalanceConstraint]);

			// can be solved with triples, and with both
			const resultTriplesOnly = solverTriplesOnly.solve(boardRequiresTriples) as SolverResultSolved;
			expect(resultTriplesOnly).toEqual({
				method: 'constraints',
				status: 'solved',
				duration: expect.any(Number),
				solutions: expect.any(Array)
			})
			expect(resultTriplesOnly.solutions).toHaveLength(1);

			// cannot be solved with balance
			const resultBalanceOnly = solverBalanceOnly.solve(boardRequiresTriples) as SolverResultUnsolvablePartial;
			expect(resultBalanceOnly).toEqual({
				method: 'constraints',
				status: 'unsolvable',
				duration: expect.any(Number),
				exhaustive: false,
				partialSolution: expect.any(String),
			})
			expect(resultBalanceOnly.partialSolution).toMatchInlineSnapshot(`"6x6;0011010..0.1..11..110010.1.1..1..0.0"`);
			// The partial solution is not the same as the boardExport => some parts could be solved
			expect(resultBalanceOnly.partialSolution).not.toBe(boardExport);
		})
	})

	describe('unsolvable_invalid results', () => {
		it('should return an unsolvable_invalid result when the input board is invalid initially', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'...1',
				'...1',
				'...1',
				'....'
			]);
			const solver = LogicSolver.create({
				constraints: 'default',
			}, {
				maxSolutions: Infinity,
			}, {});
			const result = solver.solve(board);
			expect(result).toEqual({
				method: 'initial',
				status: 'unsolvable_invalid',
				duration: expect.any(Number),
				errMessage: 'Invalid input board',
			})
		})

		it('should return an unsolvable_invalid result when the input board is found to be invalid during constraints solving', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'...1',
				'...1',
				'0...',
				'0...'
			]); // first column and last column would be the same after solving
			const solver = LogicSolver.create({
				constraints: 'default',
			}, {
				maxSolutions: Infinity,
			}, {});
			const result = solver.solve(board);
			expect(result).toEqual({
				method: 'constraints',
				status: 'unsolvable_invalid',
				duration: expect.any(Number),
				errMessage: 'Invalid board after constraints application',
			})
		})
	})
})