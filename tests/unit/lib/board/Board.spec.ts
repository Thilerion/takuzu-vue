import { SimpleBoard } from "@/lib/index.js"

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
			describe.todo('with BoardExportString');
			describe.todo('with BoardString, with/without added dimensions');
		});

	})

})