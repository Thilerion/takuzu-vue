import { SimpleBoard } from "@/lib/index.js"
import { PuzzleTransformations } from "@/lib/transformations/PuzzleTransformations.js";
import type { BoardExportString, BoardString } from "@/lib/types.js";

describe('PuzzleTransformations class', () => {
	test('square grid: the results are the same when inputting a grid to when a transformed version of that grid is created', () => {
		const puzzleA = SimpleBoard.fromArrayOfLines([
			'0011',
			'....',
			'1...',
			'0101'
		]);
		const puzzleB = SimpleBoard.fromArrayOfLines([
			'1100',
			'....',
			'0...',
			'1010'
		]) // invertSymbols relative to puzzleA
		const puzzleC = SimpleBoard.fromArrayOfLines([
			'0.10',
			'0..1',
			'1..0',
			'1..1'
		]) // rotate90, flip relative to puzzleA
		const puzzleD = SimpleBoard.fromArrayOfLines([
			'1010',
			'...1',
			'....',
			'1100',
		]) // rotate180, flip relative to puzzleA

		const resultA = new PuzzleTransformations(puzzleA.grid);
		const resultB = new PuzzleTransformations(puzzleB.grid);
		const resultC = new PuzzleTransformations(puzzleC.grid);
		const resultD = new PuzzleTransformations(puzzleD.grid);

		expect(resultA).toEqual(resultB);
		expect(resultA).toEqual(resultC);
		expect(resultA).toEqual(resultD);
	})

	test('odd grid: the results are the same when inputting a grid to when a transformed version of that grid is created', () => {
		const puzzleA = SimpleBoard.fromArrayOfLines([
			'10011',
			'.....',
			'1...1',
			'01.01',
			'.1.01',
		]);
		const puzzleB = SimpleBoard.fromArrayOfLines([
			'111.1',
			'00..1',
			'....0',
			'11..0',
			'.01.1',
		]) // rotate90, flip relative to puzzleA
		const puzzleC = SimpleBoard.fromArrayOfLines([
			// '.01.1',
			// '11..0',
			// '....0',
			// '00..1',
			// '111.1',
			'10.1.',
			'10.10',
			'1...1',
			'.....',
			'11001',
		]) // rotate180 relative to puzzleA

		const resultA = new PuzzleTransformations(puzzleA.grid);
		const resultB = new PuzzleTransformations(puzzleB.grid);
		const resultC = new PuzzleTransformations(puzzleC.grid);

		expect(resultA).toEqual(resultB);
		expect(resultA).toEqual(resultC);
	})

	test('the input grid does not get mutated', () => {
		const grid = SimpleBoard.fromArrayOfLines([
			'0011',
			'....',
			'1...',
			'0101'
		]).grid;
		const origGrid = JSON.parse(JSON.stringify(grid));
		const _result = new PuzzleTransformations(grid);
		expect(grid).toEqual(origGrid);
	})

	describe('number of transformations', () => {
		test('rect grid: 8 different transformations', () => {
			const puzzle = SimpleBoard.fromString('6x10;...0....1..1...0...11........01...1.......0..0.0..1.........' as BoardExportString);
			const result = new PuzzleTransformations(puzzle.grid);
			expect(result.getAllTransformations().size).toBe(8);
			expect([...new Set(result.getAllTransformations().values())]).toHaveLength(8);
		})
		test('odd grid: 8 different transformations', () => {
			const puzzle = SimpleBoard.fromArrayOfLines([
				'10011',
				'.....',
				'1...1',
				'01.01',
				'.1.01',
			]);
			const result = new PuzzleTransformations(puzzle.grid);
			expect(result.getAllTransformations().size).toBe(8);
			expect([...new Set(result.getAllTransformations().values())]).toHaveLength(8);
		})
		test('square grid: 16 different transformations', () => {
			const puzzle = SimpleBoard.fromArrayOfLines([
				'0..0',
				'0..1',
				'1..0',
				'1.01'
			]) // this is a canonical form
			const result = new PuzzleTransformations(puzzle.grid);
			expect(result.getAllTransformations().size).toBe(16);
			expect([...new Set(result.getAllTransformations().values())]).toHaveLength(16);
		})
	})

	test('rect grid: the results are the same when inputting a grid to when a transformed version of that grid is created', () => {
		const puzzleA = SimpleBoard.fromString('...0....1..1...0...11........01...1.......0..0.0..1.........' as BoardString);
		const puzzleB = SimpleBoard.fromString('.........0..1.1..1.......0...01........00...1...0..0....1...' as BoardString);
		const puzzleC = SimpleBoard.fromString('........1...0..0.0......1...1......0.11......0....1..1...0..' as BoardString);

		const resultA = new PuzzleTransformations(puzzleA.grid);
		const resultB = new PuzzleTransformations(puzzleB.grid);
		const resultC = new PuzzleTransformations(puzzleC.grid);

		expect(resultA).toEqual(resultB);
		expect(resultA).toEqual(resultC);
	})

	test('the transformations are correctly identified relative to the canonical form', () => {
		const puzzleA = SimpleBoard.fromArrayOfLines([
			'0011',
			'....',
			'1...',
			'0101'
		]);
		const resultA = new PuzzleTransformations(puzzleA.grid);
		const canonicalA = SimpleBoard.fromString(resultA.canonicalForm).grid;
		const resultA2 = new PuzzleTransformations(canonicalA);
		expect(resultA).toEqual(resultA2);

		const puzzleB = SimpleBoard.fromArrayOfLines([
			'111.1',
			'00..1',
			'....0',
			'11..0',
			'.01.1',
		])
		const resultB = new PuzzleTransformations(puzzleB.grid);
		const canonicalB = SimpleBoard.fromString(resultB.canonicalForm).grid;
		const resultB2 = new PuzzleTransformations(canonicalB);
		expect(resultB).toEqual(resultB2);

		const puzzleC = SimpleBoard.fromString('........1...0..0.0......1...1......0.11......0....1..1...0..' as BoardString);
		const resultC = new PuzzleTransformations(puzzleC.grid);
		const canonicalC = SimpleBoard.fromString(resultC.canonicalForm).grid;
		const resultC2 = new PuzzleTransformations(canonicalC);
		expect(resultC).toEqual(resultC2);
	})

	test('the transformations are correct for a square board', () => {
		const puzzle = SimpleBoard.fromArrayOfLines([
			'0..0',
			'0..1',
			'1..0',
			'1.01'
		]) // this is a canonical form
		const result = new PuzzleTransformations(puzzle.grid);
		expect(result.canonicalForm).toEqual(puzzle.toBoardString());

		const expectedRot90 = SimpleBoard.fromArrayOfLines([
			'1100',
			'....',
			'0...',
			'1010'
		]).toBoardString();
		expect(result.getTransformationByKey('rot90_noFlip_noInvert')).toBe(expectedRot90);

		const expectedRot180 = SimpleBoard.fromArrayOfLines([
			'10.1',
			'0..1',
			'1..0',
			'0..0'
		]).toBoardString();
		expect(result.getTransformationByKey('rot180_noFlip_noInvert')).toBe(expectedRot180);

		const expectedRot270 = SimpleBoard.fromArrayOfLines([
			'0101',
			'...0',
			'....',
			'0011'
		]).toBoardString();
		expect(result.getTransformationByKey('rot270_noFlip_noInvert')).toBe(expectedRot270);

		const expectedFlip = SimpleBoard.fromArrayOfLines([
			'1.01',
			'1..0',
			'0..1',
			'0..0',
		]).toBoardString();
		expect(result.getTransformationByKey('rot0_flip_noInvert')).toBe(expectedFlip);

		const expectedFlipRot90 = SimpleBoard.fromArrayOfLines([
			'1010',
			'0...',
			'....',
			'1100',
		]).toBoardString();
		expect(result.getTransformationByKey('rot90_flip_noInvert')).toBe(expectedFlipRot90);

		const expectedFlipRot180 = SimpleBoard.fromArrayOfLines([
			'0..0',
			'1..0',
			'0..1',
			'10.1'
		]).toBoardString();
		expect(result.getTransformationByKey('rot180_flip_noInvert')).toBe(expectedFlipRot180);

		const expectedFlipRot270 = SimpleBoard.fromArrayOfLines([
			'0011',
			'....',
			'...0',
			'0101',
		]).toBoardString();
		expect(result.getTransformationByKey('rot270_flip_noInvert')).toBe(expectedFlipRot270);
	})
})