import { expect, test, describe } from 'vitest';
import { BoardLine } from '../../../../src/lib/board/BoardLineOld';
import { SimpleBoard } from '../../../../src/lib/board/Board';

describe('BoardLine', () => {
	describe('constructor', () => {
		test('works with a simple board', () => {
			const board = SimpleBoard.empty(6, 6);
			const lineRow = new BoardLine(board, 'B');
			expect(lineRow.lineId).toBe('B');
			expect(lineRow.index).toBe(1);
			expect(lineRow.values).toEqual('......'.split(''));
			expect(lineRow.coords).toEqual([
				{ x: 0, y: 1 },
				{ x: 1, y: 1 },
				{ x: 2, y: 1 },
				{ x: 3, y: 1 },
				{ x: 4, y: 1 },
				{ x: 5, y: 1 },
			])

			const lineCol = new BoardLine(board, '3');
			expect(lineCol.lineId).toBe('3');
			expect(lineCol.index).toBe(2);
			expect(lineCol.values).toEqual('......'.split(''));
			expect(lineCol.coords).toEqual([
				{ y: 0, x: 2 },
				{ y: 1, x: 2 },
				{ y: 2, x: 2 },
				{ y: 3, x: 2 },
				{ y: 4, x: 2 },
				{ y: 5, x: 2 },
			])
		})
	})
})