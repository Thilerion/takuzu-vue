import { SimpleBoard } from "@/lib/index.js";
import { findUniqueLinesRuleViolations } from "@/lib/mistakes/violations/unique-lines-violation.js";

describe('findUniqueLinesRuleViolations()', () => {
	test('returns an empty array when there are no violations ', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'1010',
			'0110',
			'1001',
			'0101'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'1010',
			'.110',
			'....',
			'1001', // incorrect, but not duplicate
		])
		expect(findUniqueLinesRuleViolations(() => board.boardLines(), solution)).toEqual([]);
	});
	
	test('returns an empty array if there are duplicate lines in the board, but none are correct', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'1010',
			'0110',
			'1001',
			'0101'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'....',
			'1010',
			'....',
			'1010'
		]);
		expect(findUniqueLinesRuleViolations(() => board.boardLines(), solution)).toEqual([]);
	});
	
	test('returns a violation with a line that is the same is another line', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'1010',
			'0110',
			'1001',
			'0101'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'1010',
			'....',
			'1010',
			'01..'
		]);
		const result = findUniqueLinesRuleViolations(() => board.boardLines(), solution);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			type: 'uniqueLines',
			correctLine: 'A',
			lines: ['A', 'C'],
			incorrectLines: ['C'],
			incorrectCells: [
				{ x: 2, y: 2, current: '1', correctValue: '0' },
				{ x: 3, y: 2, current: '0', correctValue: '1' }
			]
		});
	});
	
	test('returns a violation if multiple lines are the same as one correct filled line', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'1010',
			'0110',
			'1001',
			'0101'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'1010',
			'....',
			'1010',
			'1010'
		]);
		const result = findUniqueLinesRuleViolations(() => board.boardLines(), solution);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			type: 'uniqueLines',
			correctLine: 'A',
			lines: ['A', 'C', 'D'],
			incorrectLines: ['C', 'D'],
		});
		expect(result[0].incorrectCells).toHaveLength(2 + 4);
	});

	test('returns a violation if multiple lines are the same as one correct filled line, when the correct filled line is not the first line the function encounters during iteration', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'1010',
			'0110',
			'1001',
			'0101'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'1001',
			'....',
			'1001',
			'1001'
		]);
		const result = findUniqueLinesRuleViolations(() => board.boardLines(), solution);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			type: 'uniqueLines',
			correctLine: 'C',
			lines: ['C', 'A', 'D'],
			incorrectLines: ['A', 'D'],
		});
		expect(result[0].incorrectCells).toHaveLength(4);
	});

	test('returns multiple violations for both rows and columns if there are any', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'010101',
			'101010',
			'110010',
			'001101',
			'101001',
			'010110'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'0.0...',
			'101010',
			'101010',
			'0.0...',
			'10101.',
			'0.0...',
		])
		// col 1 correct, col 3 duplicate
		// row B correct, row C duplicate
		const result = findUniqueLinesRuleViolations(() => board.boardLines(), solution);
		expect(result).toHaveLength(2);
		expect(result.find(r => r.correctLine === '1')).toMatchObject({
			type: 'uniqueLines',
			correctLine: '1',
			lines: ['1', '3'],
			incorrectLines: ['3'],
		});
		expect(result.find(r => r.correctLine === 'B')).toMatchObject({
			type: 'uniqueLines',
			correctLine: 'B',
			lines: ['B', 'C'],
			incorrectLines: ['C'],
		});
	});
	
	test('returns an empty array if a row is the same as a column, or vice versa (does not compare rows to columns)', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'1010',
			'0110',
			'1001',
			'0101'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'1010',
			'..0.',
			'..1.',
			'..0.'
		]); // third column is incorrect, and the same as the filled first row which is correct
		expect(findUniqueLinesRuleViolations(() => board.boardLines(), solution)).toEqual([]);
	});
})