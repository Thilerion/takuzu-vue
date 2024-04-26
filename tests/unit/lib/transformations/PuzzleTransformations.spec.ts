import { SimpleBoard } from "@/lib/board/Board.js"
import { PuzzleTransformations } from "@/lib/transformations/PuzzleTransformations.js";
import type { TransformationKey } from "@/lib/transformations/types.js";
import type { BoardExportString, BoardString } from "@/lib/types.js";

describe('PuzzleTransformations class', () => {
	describe('symmetries', () => {
		it('hasSymmetries() returns true for a grid that has a symmetry along the x or y axis', () => {
			const gridA = SimpleBoard.fromArrayOfLines([
				'1..1',
				'1..1',
				'....',
				'....'
			]).grid;
			const resultA = PuzzleTransformations.fromAnyGrid(gridA);
			expect(resultA.hasSymmetries()).toBe(true);
		})
		test('getSymmetricalTransformationKeys() returns the transformation groups that result in the same board', () => {
			const gridA = SimpleBoard.fromArrayOfLines([
				'1..1',
				'1..1',
				'....',
				'....'
			]).grid;
			const resultA = PuzzleTransformations.fromAnyGrid(gridA);
			const symmKeyGroups = resultA.getSymmetricalTransformationKeys();
			expect(symmKeyGroups).toHaveLength(8); // normally 16 different, divided by 2 because of symmetry
			expect(symmKeyGroups).toMatchInlineSnapshot(`
				[
				  [
				    "rot0_flip_invertSymbols",
				    "rot180_noFlip_invertSymbols",
				  ],
				  [
				    "rot0_flip_noInvert",
				    "rot180_noFlip_noInvert",
				  ],
				  [
				    "rot0_noFlip_invertSymbols",
				    "rot180_flip_invertSymbols",
				  ],
				  [
				    "rot0_noFlip_noInvert",
				    "rot180_flip_noInvert",
				  ],
				  [
				    "rot270_flip_invertSymbols",
				    "rot270_noFlip_invertSymbols",
				  ],
				  [
				    "rot270_flip_noInvert",
				    "rot270_noFlip_noInvert",
				  ],
				  [
				    "rot90_flip_invertSymbols",
				    "rot90_noFlip_invertSymbols",
				  ],
				  [
				    "rot90_flip_noInvert",
				    "rot90_noFlip_noInvert",
				  ],
				]
			`);
		})
		test('getSymmetricalTransformationKeys() returns all keys when there are no symmetries', () => {
			const grid = SimpleBoard.fromArrayOfLines([
				'10.1',
				'..1.',
				'0..0',
				'11.0'
			]).grid;
			const result = PuzzleTransformations.fromAnyGrid(grid);
			expect(result.hasSymmetries()).toBe(false);
			const symmKeyGroups = result.getSymmetricalTransformationKeys();
			const allKeys = result.getValidTransformationKeys();
			expect(symmKeyGroups).toHaveLength(16);
			expect(symmKeyGroups).toEqual(allKeys.map(k => [k]));
		})
		test('getRandomTransformationKey() with option uniqueOnly: true, always returns a key that is not symmetrical with any previously returned key, and correctly skips symmetrical keys as well', () => {
			const grid = SimpleBoard.fromArrayOfLines([
				'1..1',
				'1..1',
				'1..1',
				'1..1'
			]).grid;
			const result = PuzzleTransformations.fromAnyGrid(grid);
			expect(result.hasSymmetries()).toBe(true);
			// only 4 unique transformations: invert yes / no, rotate 90 / 270
			expect(result.getSymmetricalTransformationKeys()).toHaveLength(4); // x and y symmetries

			const randomKeyResults = new Set<TransformationKey>();
			// it will not return more than 4 unique keys
			for (let i = 0; i < 50; i++) {
				const key = result.getRandomTransformationKey({
					uniqueOnly: true
				});
				expect(key).not.toBe(null);
				randomKeyResults.add(key!);
			}
			expect(randomKeyResults.size).toBe(4);
		})
	})

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

		const resultA = PuzzleTransformations.fromAnyGrid(puzzleA.grid);
		const resultB = PuzzleTransformations.fromAnyGrid(puzzleB.grid);
		const resultC = PuzzleTransformations.fromAnyGrid(puzzleC.grid);
		const resultD = PuzzleTransformations.fromAnyGrid(puzzleD.grid);

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

		const resultA = PuzzleTransformations.fromAnyGrid(puzzleA.grid);
		const resultB = PuzzleTransformations.fromAnyGrid(puzzleB.grid);
		const resultC = PuzzleTransformations.fromAnyGrid(puzzleC.grid);

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
		const _result = PuzzleTransformations.fromAnyGrid(grid);
		expect(grid).toEqual(origGrid);
	})

	describe('number of transformations', () => {
		test('rect grid: 8 different transformations', () => {
			const puzzle = SimpleBoard.fromString('6x10;...0....1..1...0...11........01...1.......0..0.0..1.........' as BoardExportString);
			const result = PuzzleTransformations.fromAnyGrid(puzzle.grid);
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
			const result = PuzzleTransformations.fromAnyGrid(puzzle.grid);
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
			const result = PuzzleTransformations.fromAnyGrid(puzzle.grid);
			expect(result.getAllTransformations().size).toBe(16);
			expect([...new Set(result.getAllTransformations().values())]).toHaveLength(16);
		})
	})

	test('rect grid: the results are the same when inputting a grid to when a transformed version of that grid is created', () => {
		const puzzleA = SimpleBoard.fromString('...0....1..1...0...11........01...1.......0..0.0..1.........' as BoardString);
		const puzzleB = SimpleBoard.fromString('.........0..1.1..1.......0...01........00...1...0..0....1...' as BoardString);
		const puzzleC = SimpleBoard.fromString('........1...0..0.0......1...1......0.11......0....1..1...0..' as BoardString);

		const resultA = PuzzleTransformations.fromAnyGrid(puzzleA.grid);
		const resultB = PuzzleTransformations.fromAnyGrid(puzzleB.grid);
		const resultC = PuzzleTransformations.fromAnyGrid(puzzleC.grid);

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
		const resultA = PuzzleTransformations.fromAnyGrid(puzzleA.grid);
		const canonicalA = SimpleBoard.fromString(resultA.canonicalForm).grid;
		const resultA2 = PuzzleTransformations.fromAnyGrid(canonicalA);
		expect(resultA).toEqual(resultA2);

		const puzzleB = SimpleBoard.fromArrayOfLines([
			'111.1',
			'00..1',
			'....0',
			'11..0',
			'.01.1',
		])
		const resultB = PuzzleTransformations.fromAnyGrid(puzzleB.grid);
		const canonicalB = SimpleBoard.fromString(resultB.canonicalForm).grid;
		const resultB2 = PuzzleTransformations.fromAnyGrid(canonicalB);
		expect(resultB).toEqual(resultB2);

		const puzzleC = SimpleBoard.fromString('........1...0..0.0......1...1......0.11......0....1..1...0..' as BoardString);
		const resultC = PuzzleTransformations.fromAnyGrid(puzzleC.grid);
		const canonicalC = SimpleBoard.fromString(resultC.canonicalForm).grid;
		const resultC2 = PuzzleTransformations.fromAnyGrid(canonicalC);
		expect(resultC).toEqual(resultC2);
	})

	test('the transformations are correct for a square board', () => {
		const puzzle = SimpleBoard.fromArrayOfLines([
			'0..0',
			'0..1',
			'1..0',
			'1.01'
		]) // this is a canonical form
		const result = PuzzleTransformations.fromAnyGrid(puzzle.grid);
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