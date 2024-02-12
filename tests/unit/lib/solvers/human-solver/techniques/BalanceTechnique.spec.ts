import { BoardLine } from "@/lib/board/BoardLine"
import { humanBalanceTechnique } from "@/lib/solvers/human-solver/techniques/BalanceTechnique";
import type { PuzzleValueLine } from "@/lib/types"

describe('Human Solver HumanBalanceTechnique', () => {
	it('finds all targets in a line that can be balanced', () => {
		const boardLine = BoardLine.fromValues(
			'1.101.11..'.split('') as PuzzleValueLine,
			'A'
		);
		const emptyLine = BoardLine.fromValues(
			'......11..'.split('') as PuzzleValueLine,
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
})