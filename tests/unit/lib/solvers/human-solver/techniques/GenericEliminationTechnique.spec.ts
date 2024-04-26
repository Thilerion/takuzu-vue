import { BoardLine } from "@/lib/board/BoardLine.js";
import { SimpleBoard } from "@/lib/board/Board.js"
import { createGenericEliminationTechnique, genericEliminationTechnique, type GenericEliminationTechniqueResult } from "@/lib/solvers/human-solver/techniques/GenericEliminationTechnique.js";
import type { BoardExportString } from "@/lib/types.js"
import { splitLine } from "@/lib/utils/puzzle-line.utils.js";

describe('Human Solver GenericEliminationTechnique', () => {
	it('finds all results with leastRemaining at 1', () => {
		// This board has 3 results with leastRemaining=1, and 1 result with leastRemaining=2
		const board = SimpleBoard.fromString('10x10;1.........1.0..1...10.....0...10110.1...0..011001101010..1..1...1..1..1...01101001011001010010011011' as BoardExportString);
		const results = genericEliminationTechnique({ board }, {
			leastRemaining: [1, 1]
		});
		expect(results).toHaveLength(3);
		const sortedResults = [...results].sort((a, z) => {
			return a.remainingCounts[1] - z.remainingCounts[1];
		})
		expect(sortedResults[0]).toMatchObject({
			line: 'H',
			remainingCounts: [1, 2],
			technique: 'elim-generic',
			targets: [
				{ value: '0', x: 1, y: 7 }
			]
		} as Partial<GenericEliminationTechniqueResult>);
		expect(sortedResults[1]).toMatchObject({
			line: 'D',
			remainingCounts: [1, 3],
			technique: 'elim-generic',
			targets: [
				{ value: '0', x: 5, y: 3 }
			]
		} as Partial<GenericEliminationTechniqueResult>);
		expect(sortedResults[2]).toMatchObject({
			line: '10',
			remainingCounts: [1, 4],
			technique: 'elim-generic',
			targets: [
				{ value: '0', x: 9, y: 0 },
				{ value: '0', x: 9, y: 2 },
				{ value: '0', x: 9, y: 3 }
			]
		} as Partial<GenericEliminationTechniqueResult>);
	})

	it('finds all results with leastRemaining at 2', () => {
		// This board has 3 results with leastRemaining=1, and 1 result with leastRemaining=2
		const board = SimpleBoard.fromString('10x10;1.........1.0..1...10.....0...10110.1...0..011001101010..1..1...1..1..1...01101001011001010010011011' as BoardExportString);
		const results = genericEliminationTechnique({ board }, {
			leastRemaining: [2, 2]
		});
		expect(results).toHaveLength(1);
		const expected: GenericEliminationTechniqueResult = {
			technique: 'elim-generic',
			remainingCounts: [2, 4],
			line: 'B',
			targets: [
				{
					"x": 1,
					"y": 1,
					"value": "0"
				},
				{
					"x": 3,
					"y": 1,
					"value": "1"
				},
				{
					"x": 4,
					"y": 1,
					"value": "0"
				}
			],
			lineValues: expect.any(Array)
		}
		expect(results[0]).toEqual(expected);
	})

	it('finds all results with leastRemaining as a range of [1, 2]', () => {
		// This board has 3 results with leastRemaining=1, and 1 result with leastRemaining=2
		const board = SimpleBoard.fromString('10x10;1.........1.0..1...10.....0...10110.1...0..011001101010..1..1...1..1..1...01101001011001010010011011' as BoardExportString);
		const results = genericEliminationTechnique({ board }, {
			leastRemaining: [1, 2]
		});
		expect(results).toHaveLength(4);
		const lineIds = results.map(r => r.line);
		expect(lineIds).toEqual(expect.arrayContaining(['H', 'D', '10', 'B']));
	})

	it('does not return a result for a line that can be balanced', () => {
		const board = {
			boardLines: () => [
				BoardLine.fromValues(splitLine('00101.'), 'A'),
				BoardLine.fromValues(splitLine('.1.011'), 'B')
			]
		}
		const results = genericEliminationTechnique({ board }, {
			leastRemaining: [1, 10]
		});
		expect(results).toHaveLength(0);
	})

	it('does find results for a line that has doubles/pairs/sandwiches, which might need to be filtered out by the HumanSolver', () => {
		const line = BoardLine.fromValues(splitLine('00......'), 'C');
		const board = {
			boardLines: () => [line]
		}
		const results = genericEliminationTechnique({ board }, {
			leastRemaining: [1, 10]
		});
		expect(results).toHaveLength(1);
		expect(results[0]).toEqual({
			technique: 'elim-generic',
			remainingCounts: [2, 4],
			line: 'C',
			targets: [
				{ value: '1', ...line.getCoords(2) },
			],
			lineValues: [...line.values]
		})
	})

	it('does not return results that can be deduced as a result of filled lines (duplicate line elimination technique)', () => {
		const board = {
			boardLines: () => [
				BoardLine.fromValues(splitLine('1010'), 'A'),
				BoardLine.fromValues(splitLine('10..'), 'B') // can only be 1001 due to line A, but this technique should not find that
			]
		}
		const results = genericEliminationTechnique({ board }, {
			leastRemaining: [1, 10]
		});
		expect(results).toHaveLength(0);
	})

	it('can find results with leastRemaining=3', () => {
		const line = BoardLine.fromValues(splitLine("1..0..1..0.1.011"), "B");
		const board = { boardLines: () => [line] };
		const results1_2 = genericEliminationTechnique({ board }, {
			leastRemaining: [1, 2]
		});
		expect(results1_2).toHaveLength(0);
		const results4_10 = genericEliminationTechnique({ board }, {
			leastRemaining: [4, 10]
		});
		expect(results4_10).toHaveLength(0);
		const results3_3 = genericEliminationTechnique({ board }, {
			leastRemaining: [3, 3]
		});
		expect(results3_3).toHaveLength(1);
		// "1..0..1..0.1.011" => "1AB0AB1AB0.1.011" (0 rem 1, 2 rem 0)
		// => "1..0..1..0010011" (2 0s set) (idx:12,10 are 0)
		// => "1..0..1.10010011" (idx 8 is 1) => "1..0..1010010011" (idx 7 is 0)
		// Note: preferably this would be done stepwise with a different elimination technique, where 1..0..1..0 is recognized as 3 patterns, so countRemaining for both symbols decrease by 3, followed by a setting 2 0s, followed by some triples
		expect(results3_3[0]).toEqual({
			technique: 'elim-generic',
			remainingCounts: [3, 5],
			line: 'B',
			targets: [
				{ value: '0', ...line.getCoords(7) },
				{ value: '1', ...line.getCoords(8) },
				{ value: '0', ...line.getCoords(10) },
				{ value: '0', ...line.getCoords(12) },
			],
			lineValues: [...line.values]
		})
	})

	it('can be setup with a predefined leastRemaining range or value', () => {
		// This board has 3 results with leastRemaining=1, and 1 result with leastRemaining=2
		const board = SimpleBoard.fromString('10x10;1.........1.0..1...10.....0...10110.1...0..011001101010..1..1...1..1..1...01101001011001010010011011' as BoardExportString);

		const genericElimTechnique1_2 = createGenericEliminationTechnique([1, 2]);
		const resultsA = genericElimTechnique1_2({ board });
		expect(resultsA.length).toBeGreaterThan(1);
		expect(resultsA).toEqual(genericEliminationTechnique({ board }, { leastRemaining: [1, 2] }));

		const genericElimTechnique2 = createGenericEliminationTechnique(2);
		const resultsB = genericElimTechnique2({ board });
		expect(resultsB.length).toBe(1);
		expect(resultsB).toEqual(genericEliminationTechnique({ board }, { leastRemaining: [2, 2] }));

		const genericElimTechnique3_10 = createGenericEliminationTechnique([3, 10]);
		const resultsC = genericElimTechnique3_10({ board });
		expect(resultsC.length).toBe(0);
	});

	it('throws an error if leastRemaining is equal to or lower than 0, or if min/max in leastRemainingRange is', () => {
		const data = { board: { boardLines: () => [] } };
		expect(() => genericEliminationTechnique(data, { leastRemaining: [0, 1] })).toThrowError('be 0 or lower');
		expect(() => genericEliminationTechnique(data, { leastRemaining: [-5, -10] })).toThrowError('be 0 or lower');
		expect(() => createGenericEliminationTechnique(0)).toThrowError('be 0 or lower');
		expect(() => createGenericEliminationTechnique(-1)).toThrowError('be 0 or lower');
	})

	it('throws an error if leastRemaining lower bound is higher than upper bound', () => {
		const data = { board: { boardLines: () => [] } };
		expect(() => genericEliminationTechnique(data, { leastRemaining: [2, 1] })).toThrowError('lower than lower bound');
		expect(() => createGenericEliminationTechnique([2, 1])).toThrowError('lower than lower bound');
	})

	it('throws an error if checkEliminationStrategy returned an error because a line has no (valid) permutations and thus has no solutions', () => {
		const board = {
			boardLines: () => [
				BoardLine.fromValues(splitLine('0111....'), 'A')
			]
		}
		expect(() => genericEliminationTechnique({ board }, { leastRemaining: [1, 20] })).toThrowError('[UnsolvableBoardLineError]:');
	})
	it.todo('throws an (UnsolvableBoardLineError) if a line has no permutations or otherwise cannot be solved');

	it('accepts a maxEmptyCells option to skip processing lines with more than a certain amount of empty cells', () => {
		const board = {
			boardLines: () => [
				BoardLine.fromValues(splitLine('1.10..........'), 'A') // 11 empty
			]
		}

		const resultsA = genericEliminationTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: 10 });
		expect(resultsA).toHaveLength(0);

		const resultsB = genericEliminationTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: 11 });
		expect(resultsB).toHaveLength(1);

		// also works with the createGenericEliminationTechnique
		const genericElimTechnique = createGenericEliminationTechnique([1, 10]);
		const resultsC = genericElimTechnique({ board }, { maxEmptyCells: 10 });
		expect(resultsC).toHaveLength(0);

		const resultsD = genericElimTechnique({ board }, { maxEmptyCells: 11 });
		expect(resultsD).toHaveLength(1);
	})

	test('maxEmptyCells defaults to Infinity', () => {
		const line = BoardLine.fromValues(splitLine('1.10..........'), 'A') // 11 empty
		vi.spyOn(line, 'numEmpty', 'get').mockReturnValue(500);
		const board = {
			boardLines: () => [line]
		}
		const resultsA = genericEliminationTechnique({ board }, { leastRemaining: [1, 10] });
		expect(resultsA).toHaveLength(1);


		// make sure that the mocked return value works, by checking if results are correct with a given maxEmptyCells
		const resultsB = genericEliminationTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: 500 });
		expect(resultsB).toHaveLength(1);

		const resultsC = genericEliminationTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: 499 });
		expect(resultsC).toHaveLength(0);
	})
})