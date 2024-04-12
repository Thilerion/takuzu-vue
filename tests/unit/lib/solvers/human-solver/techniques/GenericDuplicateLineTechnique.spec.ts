import { BoardLine } from "@/lib/board/BoardLine.js";
import { SimpleBoard } from "@/lib/index.js";
import { genericDuplicateLineTechnique } from "@/lib/solvers/human-solver/techniques/GenericDuplicateLineTechnique.js";
import type { BoardExportString } from "@/lib/types.js";
import { splitLine } from "@/lib/utils/puzzle-line.utils.js";

describe('Human Solver GenericDuplicateLineTechnique', () => {
	
	it('finds all results with leastRemaining at 1, compared to a single filled line', () => {
		const line = BoardLine.fromValues(
			splitLine('.101.0'),
			'A'
		) // can be completed as 110100, or 010110
		const filledLine = BoardLine.fromValues(
			splitLine('110100'),
			'B'
		); // this filled line removes 110100 from possibilities, so result should be 010110

		const board = {
			boardLines: () => [line, filledLine]
		}
		const result = genericDuplicateLineTechnique({ board }, { leastRemaining: 1, maxEmptyCells: 2 });
		expect(result).toHaveLength(1);
		
		const { line: lineId, potentialDuplicateLines, remainingCounts, targets, technique } = result[0];
		expect(targets).toEqual([
			{ ...line.getCoords(0), value: '0' },
			{ ...line.getCoords(4), value: '1' }
		]);
		expect(lineId).toBe('A');
		expect(potentialDuplicateLines).toEqual(['B']); // line A can be completed due to line B as filled line
		expect(remainingCounts).toEqual([1, 1]);
		expect(technique).toBe('dupeLine-generic');
	});
	
	it('finds all results with leastRemaining at 2, compared to a single filled line', () => {
		const lineA = BoardLine.fromValues(
			splitLine('001..0..1011'), // 2x0 and 2x1 remaining on line of size 12
			'A'
		);
		const unrelatedFilledLineC = BoardLine.fromValues(
			splitLine('100100101101'),
			'C'
		);
		const filledLineD = BoardLine.fromValues(
			splitLine('001100101011'),
			'D'
		)
		const board = {
			boardLines: () => [lineA, unrelatedFilledLineC, filledLineD]
		}
		const results = genericDuplicateLineTechnique({ board }, { leastRemaining: 2, maxEmptyCells: Infinity });
		expect(results).toHaveLength(1);
		const result = results[0];

		const { line, potentialDuplicateLines, remainingCounts, targets } = result;
		expect(line).toBe('A');
		expect(potentialDuplicateLines).toEqual(['D']);
		expect(remainingCounts).toEqual([2, 2]);

		// line:		001..0..1011
		// filled: 		001100101011
		// try idx 3:	0011.0..1011 => 001100101011, same as filled, so at idx 3 must be 0
		// try idx 4:	0010.0..1011 => 001010..1011, so idx 4 must be a 1
		// try idx 7: 	001..0.11011 => 001010011011, possible line
		// try idx 6:	001..0.01011 => 001..0101011, also possible, so idx 6 and 7 are still unknown
		expect(targets).toHaveLength(2);
		expect(targets).toEqual([
			{ ...lineA.getCoords(3), value: '0' },
			{ ...lineA.getCoords(4), value: '1' }
		]);
	});

	it('finds results in a line where amount of 0s and 1s are not equal', () => {
		// TODO: make sure that a difficulty analyzer marks this (with 1 and 3 remaining, with the result not being a completely filled line) is substantially harder than one with 1-1 remaining and/or where the result is a completely filled line
		const lineA = BoardLine.fromValues(
			splitLine('.0..0.'),
			'A'
		);
		const filledLineB = BoardLine.fromValues(
			splitLine('100101'),
			'B'
		);
		// if we take lineA and try to place a 0 at idx 2:
		// .00.0. => 100101, equal to the filled line, so idx 2 must be a 1
		// trying to place a value at the other empty spots yields no results
		const board = {
			boardLines: () => [lineA, filledLineB]
		}
		const results = genericDuplicateLineTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: Infinity });
		expect(results).toHaveLength(1);

		const { line, potentialDuplicateLines, targets, remainingCounts } = results[0];
		expect(line).toBe('A');
		expect(potentialDuplicateLines).toEqual(['B']);
		expect(remainingCounts).toEqual([1, 3]);
		expect(targets).toHaveLength(1);
		expect(targets).toEqual([
			{ ...lineA.getCoords(2), value: '1' }
		]);
	})
	
	it.todo('finds all results that require comparing to multiple filled lines before finding a result');
	
	it('does not return results if no filled lines are present', () => {
		const board = {
			boardLines: () => [
				BoardLine.fromValues(
					splitLine('1101.0'),
					'A'
				),
				BoardLine.fromValues(
					splitLine('0101.0'),
					'B'
				),
				BoardLine.fromValues(
					splitLine('..11..'),
					'C'
				)
			]
		}
		expect(genericDuplicateLineTechnique(
			{ board },
			{ leastRemaining: [1, 10], maxEmptyCells: Infinity }
		)).toEqual([]);
	});

	it('does not use filled rows when finding results for a column, and vice versa', () => {
		const rowA = BoardLine.fromValues(
			splitLine('.101.0'),
			'A'
		) // can be completed as 110100, or 010110
		const filledRowB = BoardLine.fromValues(
			splitLine('101010'), // unrelated filledRow
			'B'
		);
		const filledColumn1 = BoardLine.fromValues(
			splitLine('110100'), // if this was a row, it could be used to complete lineA
			'1'
		)

		const board = {
			boardLines: () => [rowA, filledColumn1, filledRowB]
		}
		const result = genericDuplicateLineTechnique({ board }, { leastRemaining: 1, maxEmptyCells: 2 });
		expect(result).toEqual([]);
	});

	it('does not return results for a simple (generic) elimination, when filled lines are present but unused', () => {
		// This board has 3 results for the EliminationTechnique, but should have none for the DuplicateLineTechnique
		const board = SimpleBoard.fromString('10x10;1.........1.0..1...10.....0...10110.1...0..011001101010..1..1...1..1..1...01101001011001010010011011' as BoardExportString);

		// establish that there are both filled rows and filled columns
		const lines = [...board.boardLines()];
		const filledLines = lines.filter(line => line.isFilled);
		const filledRows = filledLines.filter(l => l.type === 'row');
		expect(filledRows.length).toBeGreaterThan(0);
		const filledColumns = filledLines.filter(l => l.type === 'column');
		expect(filledColumns.length).toBeGreaterThan(0);

		// expect no results with the DuplicateLineTechnique, where the EliminationTechnique would have results
		const results = genericDuplicateLineTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: Infinity });
		expect(results).toEqual([]);
	});

	it('throws an UnsolvableBoardLineError if no there are no valid ways to complete a line', () => {
		const invalidLineA = BoardLine.fromValues(
			splitLine('111.....'),
			'A'
		);
		// a filled line is still required, else the lineA would not even be processed
		const filledLineB = BoardLine.fromValues(
			splitLine('10101010'),
			'B'
		)
		const board = {
			boardLines: () => [invalidLineA, filledLineB]
		}
		expect(() => {
			genericDuplicateLineTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: Infinity });
		}).toThrowError('UnsolvableBoardLineError');
	});
	
	it('throws an UnsolvableBoardLineError if no there are no valid ways to complete a line due to filled lines', () => {
		const lineA = BoardLine.fromValues(
			splitLine('.101.0'),
			'A'
		) // can be completed as 110100, or 010110
		const filledLineB = BoardLine.fromValues(
			splitLine('110100'),
			'B'
		); // this filled line removes 110100 from possibilities
		const filledLineC = BoardLine.fromValues(
			splitLine('010110'),
			'C'
		); // this filled line removes 010110 from possibilities, so there are no possible ways to complete lineA

		const board = {
			boardLines: () => [lineA, filledLineB, filledLineC]
		}
		expect(() => {
			genericDuplicateLineTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: Infinity });
		}).toThrowError('UnsolvableBoardLineError');
	});

})