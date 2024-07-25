import { SimpleBoard } from "@/lib/board/Board.js";
import { LogicSolver } from "@/lib/solvers/logic-solver/LogicSolver.js";
import type { SolverResultIncompleteMaxSolutions, SolverResultSolved } from "@/lib/solvers/logic-solver/helpers/SolverResult.js";


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
})