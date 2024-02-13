import { SimpleBoard } from "@/lib/index.js";
import { findBalancedLinesRuleViolations } from "@/lib/mistakes/violations/balanced-line-violation.js";
import type { BoardExportString } from "@/lib/types.js";

describe('findBalancedLinesRuleViolations()', () => {
	it('returns an empty array when there are no violations', () => {
		const board = SimpleBoard.import('6x6;..01.0.01...0100..0.1101..00.00..0..' as BoardExportString);
		const solution = SimpleBoard.import('6x6;110100101100010011001101110010001011' as BoardExportString);
		expect(findBalancedLinesRuleViolations(() => board.boardLines(), solution)).toEqual([])
	})

	it('returns a single violation when a line is imbalanced', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'110100',
			'101100',
			'010011',
			'001101',
			'110010',
			'001011'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'......',
			'11..11', // imbalanced: line "B", solution: 101100, so all but the first cell are incorrect
			'......',
			'..11..',
			'..00..',
			'..10.1'
		]);
		const result = findBalancedLinesRuleViolations(() => board.boardLines(), solution);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			type: 'balancedLines',
			lineId: 'B',
			symbol: '1',
			amountOver: 1,
		});
		const incorrectCells = result[0].incorrectCells;
		expect(incorrectCells).toHaveLength(3);
		expect(incorrectCells).toContainEqual({ x: 1, y: 1, current: '1', correctValue: '0' });
		expect(incorrectCells).toContainEqual({ x: 4, y: 1, current: '1', correctValue: '0' });
		expect(incorrectCells).toContainEqual({ x: 5, y: 1, current: '1', correctValue: '0' });
	})
})