import { SimpleBoard } from "@/lib/index.js";
import type { BoardExportString, PuzzleValueLine } from "@/lib/types.js";
import { COLUMN, EMPTY, ONE, ROW, ZERO } from "@/lib/constants.js";
import { BoardLine } from "@/lib/board/BoardLine.js";

describe('boardLine', () => {
	let board6x10: SimpleBoard;
	beforeEach(() => {
		board6x10 = SimpleBoard.import("6x10;........01.1..0......0..01...0....11........1.0.1.1.......11" as BoardExportString);
	})

	describe('constructor', () => {
		it('works with a board and a column id', () => {
			const columnId = '3';
			const lineCol = BoardLine.fromBoard(board6x10, columnId);

			expect(lineCol.values).toEqual('.00....11.'.split(''));
			expect(lineCol.type).toBe(COLUMN);
			expect(lineCol.index).toBe(2);
			expect(lineCol.lineId).toBe(columnId);
			expect(lineCol.length).toBe(10);
		})

		it('works with a board and a row id', () => {
			const rowId = "B";
			const lineRow = BoardLine.fromBoard(board6x10, rowId);

			expect(lineRow.values).toEqual('..01.1'.split(''));
			expect(lineRow.type).toBe(ROW);
			expect(lineRow.index).toBe(1);
			expect(lineRow.lineId).toBe(rowId);
			expect(lineRow.length).toBe(6);
		})

		it('works with a values array', () => {
			const values = '..01.1'.split('') as PuzzleValueLine;
			const rowId = 'B';
			
			const lineRow = BoardLine.fromValues(values, rowId);
			expect(lineRow.values).toEqual(values);
			expect(lineRow.type).toBe(ROW);
			expect(lineRow.index).toBe(1);
			expect(lineRow.lineId).toBe(rowId);
			expect(lineRow.length).toBe(6);
		})

	})

	describe('fromBoard vs fromValues', () => {
		const properties = [
			'length', 'values', 'coords', 'counts', 'numRequired', 'validPermutations',
			'numEmpty', 'numFilled', 'isFilled', 'leastRem', 'mostRem'
		] as const;

		test('fromBoard has the same values for getters as fromValues', () => {
			const board = board6x10;
			const values = board.getLine('B');

			const withBoard = BoardLine.fromBoard(board, 'B');
			const withValues = BoardLine.fromValues(values, 'B');

			expect(values).toEqual('..01.1'.split(''));

			for (const p of properties) {
				const boardVal = withBoard[p];
				const valuesVal = withValues[p];

				expect(boardVal).not.toBe(null);
				expect(boardVal).toEqual(valuesVal);
			}
		})
	})

	describe('getter properties', () => {
		let line: BoardLine;
		let lineFilled: BoardLine;
		
		beforeEach(() => {
			line = BoardLine.fromBoard(board6x10, 'B');
			lineFilled = BoardLine.fromValues('1100'.split('') as any, 'B');
		})

		test('values', () => {
			expect(line.values).toEqual('..01.1'.split(''));
			expect(line.length).toBe(6);
		})

		test('coords', () => {
			expect(line.coords).toEqual([
				{ x: 0, y: 1 },
				{ x: 1, y: 1 },
				{ x: 2, y: 1 },
				{ x: 3, y: 1 },
				{ x: 4, y: 1 },
				{ x: 5, y: 1 },
			]);
		})

		test('counts', () => {
			expect(line.counts).toEqual({
				[EMPTY]: 3,
				[ZERO]: 1,
				[ONE]: 2
			});
		})

		test('numRequired', () => {
			expect(line.numRequired).toEqual({
				[ZERO]: 3,
				[ONE]: 3
			});
		})

		test('countRemaining, leastRem, and mostRem, rem per symbol', () => {
			expect(line.countRemaining).toEqual({
				[ONE]: 1,
				[ZERO]: 2
			})
			expect(line.leastRem).toBe(1);
			expect(line.mostRem).toBe(2);

			expect(line.leastRemSymbol).toBe(ONE);
			expect(line.mostRemSymbol).toBe(ZERO);
		})

		test('leastRemSymbol/mostRemSymbol return null if line is filled', () => {
			expect(lineFilled.countRemaining).toEqual({
				[ONE]: 0,
				[ZERO]: 0
			})
			expect(lineFilled.leastRemSymbol).toBe(null);
			expect(lineFilled.mostRemSymbol).toBe(null);
		})

		test('leastRemSymbol/mostRemSymbol return "both" as string if both symbols have the same amount remaining', () => {
			const lineBoth = BoardLine.fromValues('10..'.split('') as any, 'B');
			expect(lineBoth.countRemaining).toEqual({
				[ONE]: 1,
				[ZERO]: 1
			})
			expect(lineBoth.leastRemSymbol).toBe('both');
			expect(lineBoth.mostRemSymbol).toBe('both');
		})

		test('numEmpty, numFilled, isFilled', () => {
			expect(line.isFilled).toBe(false);
			expect(lineFilled.isFilled).toBe(true);

			expect(line.numFilled).toBe(3);
			expect(line.numEmpty).toBe(3);
		})

		test.todo('.validPermutations')
		test.todo('.validPermutations if filled')
		test.todo('.validPermutations if invalid')
		test.todo('remaining counts if line has too many of a symbol; error?');
	})

})