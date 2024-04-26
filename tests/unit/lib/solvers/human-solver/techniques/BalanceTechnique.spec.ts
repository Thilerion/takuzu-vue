import { BoardLine } from "@/lib/board/BoardLine"
import { SimpleBoard } from "@/lib/board/Board.js";
import { humanBalanceTechnique } from "@/lib/solvers/human-solver/techniques/BalanceTechnique";
import { splitLine } from "@/lib/utils/puzzle-line.utils.js";

describe('Human Solver HumanBalanceTechnique', () => {
	it('finds all targets in a line that can be balanced', () => {
		const boardLine = BoardLine.fromValues(
			splitLine('1.101.11..'),
			'A'
		);
		const emptyLine = BoardLine.fromValues(
			splitLine('......11..'),
			'B'
		)
		const board = {
			boardLines: () => [boardLine, emptyLine]
		};
		const result = humanBalanceTechnique({ board });
		expect(result).toHaveLength(1);
		expect(result[0].lineId).toBe('A');
		expect(result[0].technique).toBe('balance');
		expect(result[0].targets).toHaveLength(4);
		expect(result[0].targets.every(t => t.value === '0')).toBe(true);
	})

	it('finds all lines that can be balanced', () => {
		const board = SimpleBoard.fromArrayOfLines([
			'1.1.1.', // can be balanced with 3x0
			'010101',
			'......',
			'11010.', // can be balanced with single 0
			'......',
			'1.....',
		])
		// column 1 can be balanced

		const result = humanBalanceTechnique({ board });
		expect(result).toHaveLength(3);
		const balancedLineIds = new Set(result.map(r => r.lineId));
		expect(balancedLineIds).toEqual(new Set(['A', 'D', '1']));
	})

	it('does not modify the board', () => {
		const board = SimpleBoard.fromArrayOfLines([
			'1.1.1.', // can be balanced with 3x0
			'010101',
			'......',
			'11010.', // can be balanced with single 0
			'......',
			'1.....',
		])
		const str = board.toBoardString();
		const result = humanBalanceTechnique({ board });
		expect(result).toHaveLength(3);

		expect(board.toBoardString()).toBe(str);
	})
})