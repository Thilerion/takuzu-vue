import { SimpleBoard, Solver, selectCell, selectValue } from "@/lib/index.js";
import type { SolverConfig } from "@/lib/solver/types.js";

describe("Solver", () => {
	describe("using backtracking only", () => {
		const solverConf = (): SolverConfig => ({
			disableBacktracking: false,
			selectCell: selectCell.first_empty,
			selectValue: selectValue.least_constraining,
			constraintFns: [],
			maxSolutions: Infinity,
			throwAfterTimeout: false,
			timeoutDuration: 5000
		})

		it('should solve a small puzzle with a single solution', () => {
			const gridArr = [
				'1..1',
				'1...',
				'..0.',
				'....'
			]
			const board = SimpleBoard.fromArrayOfLines(gridArr);
			const result = Solver.run(board, solverConf());
			expect(result.length).toBe(1);
			expect(result[0].grid.map(r => r.join(''))).toEqual([
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
			const result = Solver.run(board, solverConf());
			expect(result.length).toBe(0);
		})

		it('finds multiple solutions if there are multiple valid solutions', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'....',
				'....'
			])
			const result = Solver.run(board, solverConf());
			expect(result.length).toBe(4);

			const solutions = result.map(b => b.export());
			expect(new Set(solutions).size).toBe(4); // all solutions found are unique
		})

		it('stops after reaching maxSolutions, even if there are more to be found', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'....',
				'....'
			])
			expect(Solver.run(board, solverConf()).length).toBe(4);

			// has 4 solutions. If maxSolutions is set to 2, the result should have 2 solutions
			const conf: SolverConfig = {
				...solverConf(),
				maxSolutions: 2
			}
			expect(Solver.run(board, conf).length).toBe(2);
		})
	})
})