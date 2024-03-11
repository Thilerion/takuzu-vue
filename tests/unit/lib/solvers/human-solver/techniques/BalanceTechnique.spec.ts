import { BoardLine } from "@/lib/board/BoardLine"
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
})