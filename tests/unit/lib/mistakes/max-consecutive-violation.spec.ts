import { ONE, ZERO } from "@/lib/constants.js";
import { SimpleBoard } from "@/lib/index.js";
import { findMaxConsecutiveRuleViolations } from "@/lib/mistakes/max-consecutive-violation.js";
import type { BoardExportString } from "@/lib/types.js";

describe('findMaxConsecutiveRuleViolations()', () => {
	it('returns an empty array when there are no max consecutive rule violations', () => {
		const board = SimpleBoard.fromString('6x10;11.1000.010.0.....1100.01.1.000100..10.001010..00...011..0.0' as BoardExportString);
		const solution = SimpleBoard.fromString('6x10;110100010101001011110010101100010011101001010110001101101010' as BoardExportString);
		const result = findMaxConsecutiveRuleViolations(() => board.boardLines(), solution);
		expect(result).toEqual([]);
	})

	it('returns an array with groups of max consecutive rule violations when there are max consecutive rule violations', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'110100',
			'101100',
			'010011',
			'001101',
			'110010',
			'001011'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'111100',
			'....0.',
			'......',
			'....0.',
			'..0000',
			'....0.',
		]);

		const result = findMaxConsecutiveRuleViolations(() => board.boardLines(), solution);
		expect(result).toHaveLength(3);

		const [firstRes, secondRes, thirdRes] = result;
		expect(firstRes).toMatchObject({
			type: 'maxConsecutive',
			cells: [
				{ x: 0, y: 0, value: ONE },
				{ x: 1, y: 0, value: ONE },
				{ x: 2, y: 0, value: ONE },
				{ x: 3, y: 0, value: ONE },
			],
			incorrectCells: [
				{ x: 2, y: 0, current: ONE, correctValue: ZERO },
			]
		})

		expect(secondRes.type).toBe('maxConsecutive');
		expect(secondRes.cells).toEqual([
			{ x: 2, y: 4, value: ZERO },
			{ x: 3, y: 4, value: ZERO },
			{ x: 4, y: 4, value: ZERO },
			{ x: 5, y: 4, value: ZERO },
		])
		expect(secondRes.incorrectCells).toHaveLength(1);

		expect(thirdRes.type).toBe('maxConsecutive');
		expect(thirdRes.cells).toEqual([
			{ x: 4, y: 3, value: ZERO },
			{ x: 4, y: 4, value: ZERO },
			{ x: 4, y: 5, value: ZERO },
		]);
		expect(thirdRes.incorrectCells).toHaveLength(2);
	})
})