import { SimpleBoard } from "@/lib/index.js"
import type { BoardExportString, BoardString } from "@/lib/types.js"

describe('Board class', () => {
	describe('constructors', () => {
		describe('.empty', () => {
			test('.empty(N) creates an empty Board of NxN', () => {
				const board = SimpleBoard.empty(4);
				expect(board).toMatchObject({
					width: 4,
					height: 4
				})
				expect(board.grid).toHaveLength(4);
				expect(board.grid[0]).toHaveLength(4);
				expect(board.grid.every(row => row.every(val => val === '.'))).toBe(true);
			})
			test('.empty(W, H) creates a Board of WxH', () => {
				const board = SimpleBoard.empty(4, 5);
				expect(board).toMatchObject({
					width: 4,
					height: 5
				})
				expect(board.grid).toHaveLength(5);
				expect(board.grid[0]).toHaveLength(4);
			})
		})

		describe('.fromArrayOfLines()', () => {
			test('correctly creates a Board from an array of strings', () => {
				const arr = [
					'1.1.',
					'....',
					'..0.',
					'...1'
				];
				const board = SimpleBoard.fromArrayOfLines(arr);
				expect(board).toMatchObject({
					width: 4,
					height: 4
				})
				expect(board.grid).toEqual(arr.map(l => l.split('')));
			})
			test('throws an error if an unexpected value is encountered', () => {
				expect(() => SimpleBoard.fromArrayOfLines([
					'010.',
					'....',
					'....',
					'....'
				])).not.toThrow()
				expect(() => SimpleBoard.fromArrayOfLines([
					'010x',
					'....',
					'....',
					'....'
				])).toThrowError('not all values are PuzzleValues')
				expect(() => SimpleBoard.fromArrayOfLines([
					'0102',
					'....',
					'....',
					'....',
				])).toThrowError('not all values are PuzzleValues')
			})
		})

		describe('.from2DArray()', () => {
			test('.from2dArray correctly creates a board from a 2d array of PuzzleValue strings', () => {
				const arr = [
					['1', '.', '1', '.'],
					['.', '.', '.', '.'],
					['.', '.', '0', '.'],
					['.', '.', '.', '1']
				];
				const board = SimpleBoard.from2dArray(arr);
				expect(board).toMatchObject({
					width: 4,
					height: 4
				})
				expect(board.grid).toEqual(arr);
			})
			test('.from2dArray also accepts 1 and 0 as numbers, and null/undefined/empty string as empty', () => {
				const board = SimpleBoard.from2dArray([
					[1, 0, 1, 0],
					["1", "0", "1", "0"],
					[" ", null, undefined, ""],
					[".", ".", ".", "."]
				]);
				expect(board.grid).toEqual([
					['1', '0', '1', '0'],
					['1', '0', '1', '0'],
					['.', '.', '.', '.'],
					['.', '.', '.', '.']
				])
			})
		
			test('.from2dArray throws an error if an unexpected value is encountered', () => {
				expect(() => SimpleBoard.from2dArray([
					['1']
				])).not.toThrow();
				expect(() => SimpleBoard.from2dArray([
					['x'],
				])).toThrowError('Cannot parse ["x"]')
				expect(() => SimpleBoard.from2dArray([
					[2],
				])).toThrowError('Cannot parse [2]')
			})
		})

		describe('.import()/.fromString()', () => {
			describe('with BoardExportString', () => {
				it('works', () => {
					const str = '4x4;1010....1.0..0.1' as BoardExportString;
					const board = SimpleBoard.import(str);
					expect(board).toMatchObject({
						width: 4,
						height: 4
					})
					const asExported = board.export();
					expect(asExported).toBe(str);
				})
			});

			describe('with BoardString', () => {
				it('correctly creates a Board from a string of 1s, 0s, and .s', () => {
					const str = '1010....1.0..0.1' as BoardString;
					const board = SimpleBoard.fromString(str);
					expect(board).toMatchObject({
						width: 4,
						height: 4
					})
					const asBoardString = board.toBoardString();
					expect(asBoardString).toBe(str);
				})

				it('correctly deduces the board shape/dimensions', () => {
					const strA = '.'.repeat(4 * 4) as BoardString;
					expect(SimpleBoard.fromString(strA)).toMatchObject({
						width: 4,
						height: 4
					})
					const strB = '.'.repeat(11 * 11) as BoardString;
					expect(SimpleBoard.fromString(strB)).toMatchObject({
						width: 11,
						height: 11
					})
					const strC = '.'.repeat(6 * 10) as BoardString;
					expect(SimpleBoard.fromString(strC)).toMatchObject({
						width: 6,
						height: 10
					})
				})

				it('uses the given width/height if provided, but gives an error if inconsistent with boardStr length', () => {
					const str2x4 = '.'.repeat(2 * 4) as BoardString;

					// throws, as 2x4 is an unknown board size
					expect(() => SimpleBoard.fromString(str2x4))
						.toThrowErrorMatchingInlineSnapshot(`[Error: Cannot deduce correct puzzle size from this length (8)]`);
					// works if dimensions are given
					expect(SimpleBoard.fromString(str2x4, { width: 2, height: 4})).toMatchObject({
						width: 2,
						height: 4
					})
					// throws if dimensions are given that don't match the boardStr length
					expect(() => SimpleBoard.fromString(str2x4, { width: 4, height: 4}))
						.toThrowErrorMatchingInlineSnapshot(`[Error: Unexpected boardStr size, smaller than board dimensions (str len: 8, dimensions: 4x4=16)]`);
				})

				it('accepts any character, treats 0 and 1 as the puzzle symbols, everything else as EMPTY', () => {
					const str = [
						'1010',
						'22!x',
						'....',
						'1.0.'
					].join('') as BoardString;
					const board = SimpleBoard.fromString(str);
					expect(board).toMatchObject({
						width: 4,
						height: 4
					})
					expect(board.grid).toEqual([
						['1', '0', '1', '0'],
						['.', '.', '.', '.'],
						['.', '.', '.', '.'],
						['1', '.', '0', '.']
					])
				})
			});
		});

	})

})