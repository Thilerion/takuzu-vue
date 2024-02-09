import { SimpleBoard, Solver, selectCell, selectValue } from "@/lib/index.js";
import applyEliminationConstraint from "@/lib/solver/constraints/Elimination.js";
import applyLineBalanceConstraint from "@/lib/solver/constraints/LineBalance.js";
import applyTriplesConstraint from "@/lib/solver/constraints/Triples.js";
import type { SolverConfig } from "@/lib/solver/types.js";
import type { BoardExportString } from "@/lib/types.js";

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

	describe('without backtracking, with specific constraints', () => {
		const solverConf = (
			constraintFns: SolverConfig['constraintFns']
		): SolverConfig => ({
			disableBacktracking: true,
			selectCell: selectCell.first_empty,
			selectValue: selectValue.least_constraining,
			constraintFns,
			maxSolutions: 2,
			throwAfterTimeout: false,
			timeoutDuration: 5000
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
			const conf = solverConf([applyTriplesConstraint]);
			const result = Solver.run(board, conf);
			expect(result).toHaveLength(1);
			expect(result[0].toBoardString()).toBe([
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
			const conf = solverConf([applyLineBalanceConstraint]);
			const result = Solver.run(board, conf);
			expect(result).toHaveLength(1);
			expect(result[0].toBoardString()).toBe([
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

			const confBalanceOnly = solverConf([applyLineBalanceConstraint]);
			const confTriplesOnly = solverConf([applyTriplesConstraint]);
			const confBoth = solverConf([applyTriplesConstraint, applyLineBalanceConstraint]);

			// can be solved with triples technique
			expect(Solver.run(boardRequiresTriples, confTriplesOnly)).toHaveLength(1);
			// cannot be solved with (just) balance technique
			expect(Solver.run(boardRequiresTriples, confBalanceOnly)).toHaveLength(0);
			// but can be solved with both again
			expect(Solver.run(boardRequiresTriples, confBoth)).toHaveLength(1);
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
			const confBalanceOnly = solverConf([applyLineBalanceConstraint]);
			const confTriplesOnly = solverConf([applyTriplesConstraint]);
			const confBoth = solverConf([applyTriplesConstraint, applyLineBalanceConstraint]);

			// can be solved with balance technique
			expect(Solver.run(boardRequiresBalance, confBalanceOnly)).toHaveLength(1);
			// cannot be solved with (just) triples technique
			expect(Solver.run(boardRequiresBalance, confTriplesOnly)).toHaveLength(0);
			// but can be solved with both again
			expect(Solver.run(boardRequiresBalance, confBoth)).toHaveLength(1);
		})

		test('a board that requires difficulty techniques cannot be solved with just triples or balance', () => {
			// these boards require an elim-1-2 technique to be solved
			const boardOdd = SimpleBoard.import('7x7;.1...............0..01......0...0..101....0.....0' as BoardExportString);
			const boardRect = SimpleBoard.import('6x10;.1....01...1101010100101011010.1001.10.10.0....10....01..0.1' as BoardExportString);

			const confEasy = solverConf([applyTriplesConstraint, applyLineBalanceConstraint]);
			const confWithElim12 = solverConf([
				applyTriplesConstraint, applyLineBalanceConstraint,
				(board: SimpleBoard) => applyEliminationConstraint(board, { minLeast: 1, maxLeast: 2 })
			])

			// can be solved with elim-1-2 technique
			expect(Solver.run(boardOdd, confWithElim12)).toHaveLength(1);
			expect(Solver.run(boardRect, confWithElim12)).toHaveLength(1);

			// cannot be solved with (just) triples or balance techniques
			expect(Solver.run(boardOdd, confEasy)).toHaveLength(0);
			expect(Solver.run(boardRect, confEasy)).toHaveLength(0);
		})
	})
})