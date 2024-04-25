import { BoardAssignmentError, BoardOutOfBoundsError } from "@/lib/board/Board.js"
import { ThreesUnit } from "@/lib/board/ThreesUnit.js"
import { EMPTY, ONE, ZERO } from "@/lib/constants.js"
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

	describe('properties', () => {

		it('generates the correct row ids', () => {
			const board = SimpleBoard.empty(4);
			expect(board.rowIds).toEqual(['A', 'B', 'C', 'D']);
		});
		it('generates the correct column ids', () => {
			const board = SimpleBoard.empty(4);
			expect(board.columnIds).toEqual(['1', '2', '3', '4']);
		})
		it('generates the correct line ids', () => {
			const board = SimpleBoard.empty(4);
			expect(board.lineIds).toEqual(['A', 'B', 'C', 'D', '1', '2', '3', '4']);
		})

		it('generates the correct "numRequired" for rows and columns', () => {
			const board4x6 = SimpleBoard.empty(4, 6);
			expect(board4x6.numRequired).toEqual({
				row: {
					"0": 2,
					"1": 2,
				},
				column: {
					"0": 3,
					"1": 3,
				}
			})

			const board5x5 = SimpleBoard.empty(5);
			const expected = { "0": 2, "1": 3 };
			expect(board5x5.numRequired).toEqual({
				row: expected,
				column: expected
			})
		})
	})

	describe('retrieve value methods', () => {
		describe('.get()', () => {
			test('returns value on grid at given coordinates', () => {
				const board = SimpleBoard.fromArrayOfLines([
					'1010',
					'1..1',
					'0..1',
					'0.0.'
				])
				expect(board.get(0, 0)).toBe(ONE);
				expect(board.get(1, 0)).toBe(ZERO);
				expect(board.get(0, 1)).toBe(ONE);
			})

			it('throws on OutOfBoundsError if x or y is out of bounds', () => {
				const board = SimpleBoard.empty(4);
				expect(() => board.get(4, 0)).toThrowError(BoardOutOfBoundsError);
				expect(() => board.get(0, 4)).toThrowError(BoardOutOfBoundsError);
				expect(() => board.get(-1, 0)).toThrowError(BoardOutOfBoundsError);
				expect(() => board.get(0, -0.5)).toThrowError(BoardOutOfBoundsError);
			})
		})

		test('.atPos() returns the correct value with a Vec object', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1010',
				'1..1',
				'0..1',
				'0.0.'
			])
			expect(board.atPos({ x: 0, y: 0 })).toBe(ONE);
			expect(board.atPos({ x: 1, y: 0 })).toBe(ZERO);
			expect(board.atPos({ x: 0, y: 1 })).toBe(ONE);
			expect(board.atPos({ x: 1, y: 3 })).toBe(EMPTY);
		})

		describe('get[Line]()', () => {
			let board: SimpleBoard;
			beforeEach(() => {
				board = SimpleBoard.fromArrayOfLines([
					'1010',
					'1..1',
					'0..1',
					'0.0.'
				])
			});

			test('getLine("A") returns the correct row', () => {
				expect(board.getLine('A')).toEqual([ONE, ZERO, ONE, ZERO]);
			})
			test('getLine("1") returns the correct column', () => {
				expect(board.getLine('1')).toEqual([ONE, ONE, ZERO, ZERO]);
			})
			test('getLine with a line id that does not exist on the board throws an out of bounds error', () => {
				expect(() => board.getLine('Z')).toThrowError(BoardOutOfBoundsError);
				expect(() => board.getLine('abc')).toThrowError(BoardOutOfBoundsError);
				expect(() => board.getLine('')).toThrowError(BoardOutOfBoundsError);
			})
		
			test('getRow and getColumn allow numbers as the index of the line', () => {
				const colZero = board.getColumn(0);
				const colZeroId = board.getColumn('1');
				expect(colZero).toEqual(colZeroId);

				const rowZero = board.getRow(0);
				const rowAId = board.getRow('A');
				expect(rowZero).toEqual(rowAId);
			})

			test('getRow and getColumn throw an OutOfBoundsError if row id or index is out of bounds', () => {
				expect(() => board.getRow(4)).toThrowError(BoardOutOfBoundsError);
				expect(() => board.getColumn(4)).toThrowError(BoardOutOfBoundsError);
				expect(() => board.getRow(-1)).toThrowError(BoardOutOfBoundsError);
				expect(() => board.getColumn(-1)).toThrowError(BoardOutOfBoundsError);
				expect(() => board.getRow('E')).toThrowError(BoardOutOfBoundsError);
				expect(() => board.getColumn('5')).toThrowError(BoardOutOfBoundsError);

				expect(() => board.getRow('D')).not.toThrowError(BoardOutOfBoundsError);
				expect(() => board.getColumn('4')).not.toThrowError(BoardOutOfBoundsError);
			})
		})
	})

	describe('set/assign value methods', () => {
		let board: SimpleBoard;
		beforeEach(() => {
			board = SimpleBoard.empty(4);
		})
		test('u_set() sets a value on the grid without any validation', () => {
			board.u_set(0, 0, ONE);
			expect(board.get(0, 0)).toBe(ONE);

			expect(board.grid[0]).toHaveLength(4);
			// this works because it is not validated against board height/width
			board.u_set(5, 0, ZERO);
			expect(() => board.get(5, 0)).toThrowError(BoardOutOfBoundsError);
			expect(board.grid[0]).toHaveLength(6);
		})

		describe('assign()', () => {
			it('sets a value on the grid', () => {
				expect(board.get(1, 0)).toBe(EMPTY);
				board.assign(1, 0, ONE);
				expect(board.get(1, 0)).toBe(ONE);
				board.assign(1, 0, EMPTY);
				expect(board.get(1, 0)).toBe(EMPTY);
			})

			it('throws a BoardAssignmentError if x or y are null', () => {
				expect(() => board.assign(null as any as number, 0, ONE)).toThrowError(BoardAssignmentError);
				expect(() => board.assign(0, null as any as number, ONE)).toThrowError(BoardAssignmentError);			
			})

			it.todo('throws a BoardAssignmentError if the value is not a PuzzleValue', () => {
				expect(() => board.assign(0, 0, 'x' as any)).toThrowError(BoardAssignmentError);
				expect(() => board.assign(0, 0, 2 as any)).toThrowError(BoardAssignmentError);
				// @ts-expect-error - 2 instead of 3 arguments
				expect(() => board.assign(0, 0)).toThrowError(BoardAssignmentError);
				// @ts-expect-error - null is not a PuzzleValue
				expect(() => board.assign(0, 0, null)).toThrowError(BoardAssignmentError);
			})

			it('throws a BoardAssignmentError if x or y are out of bounds', () => {
				expect(() => board.assign(4, 0, ONE)).toThrowError(BoardAssignmentError);
				expect(() => board.assign(0, 4, ONE)).toThrowError(BoardAssignmentError);
				expect(() => board.assign(-1, 0, ONE)).toThrowError(BoardAssignmentError);
				expect(() => board.assign(0, -1, ONE)).toThrowError(BoardAssignmentError);
			})

		})
	})

	describe('iteration', () => {

		describe.todo('cells()');

		describe.todo('cellCoords()');

		describe.todo('lineStrings()');

		describe('threesUnits()', () => {
			it('returns 16 ThreesUnits for a 4x4 board', () => {
				const board = SimpleBoard.empty(4);
				const result = [...board.threesUnits()];
				expect(result).toHaveLength(16);
				expect(result.every(i => i instanceof ThreesUnit)).toBe(true);
			})

			it('uses the correct x,y start coordinates for each ThreesUnit', () => {
				const board = SimpleBoard.empty(4);
				const result = [...board.threesUnits()];
				expect(result.map(i => `${i.x},${i.y}`).sort()).toEqual([
					// horizontal
					[0, 0], [1, 0],
					[0, 1], [1, 1],
					[0, 2], [1, 2],
					[0, 3], [1, 3],
					// vertical
					[0, 0], [1, 0], [2, 0], [3, 0],
					[0, 1], [1, 1], [2, 1], [3, 1],
				].map(([x, y]) => `${x},${y}`).sort())
			})
		});

		describe.todo('boardLines()');

	})

})