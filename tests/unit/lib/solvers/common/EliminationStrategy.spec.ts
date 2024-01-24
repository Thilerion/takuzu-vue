import { BoardLine } from "@/lib/board/BoardLine.js";
import { ONE, ZERO, EMPTY } from "@/lib/constants.js";
import { checkEliminationStrategy, getRecurringValuesFromPermutations, removeFilledLinesFromPermutationsWithSources } from "@/lib/solvers/common/EliminationStrategy.js";
import { removeFilledLinesFromPermutations } from "@/lib/solvers/common/EliminationStrategy.js";

describe('checkEliminationStrategy', () => {
	it('should return no result if line is filled', () => {
		expect(checkEliminationStrategy({ isFilled: true } as BoardLine)).toEqual({
			found: false
		})
	})

	it('should return an error result if there are no valid permutations', () => {
		const line = BoardLine.fromValues(['0', '.', '.', '1'], 'A');
		vi.spyOn(line, 'validPermutations', 'get').mockReturnValue([]);
		expect(checkEliminationStrategy(line)).toEqual({
			found: false,
			error: 'No valid permutations found',
			invalid: true
		})
	})

	it('should return an error result if there are no valid permutations due to filledLines (duplicate lines)', () => {
		const line = BoardLine.fromValues(['0', '.', '.', '1'], 'A');
		vi.spyOn(line, 'validPermutations', 'get').mockReturnValue([
			['0', '1', '0', '1']
		]);
		const filledLines = [
			BoardLine.fromValues(['0', '1', '0', '1'], 'A')
		];
		const result = checkEliminationStrategy(line, filledLines);
		expect(result).toEqual({
			found: false,
			error: 'No valid permutations remaining after removing filled lines',
			invalid: true
		})
	})

	it('should return no result if there are no recurring values in the filtered permutations', () => {
		const line = BoardLine.fromValues(['0', '.', '.', '1'], 'A');
		vi.spyOn(line, 'validPermutations', 'get').mockReturnValue([
			['0', '1', '0', '1'],
			['1', '0', '1', '0'],
		]);
		const result = checkEliminationStrategy(line);
		expect(result).toEqual({
			found: false
		})
	})

	it('should return a result if there are recurring values in the filtered permutations', () => {
		const line = BoardLine.fromValues(['0', '.', '.', '1'], 'A');
		vi.spyOn(line, 'validPermutations', 'get').mockReturnValue([
			['0', '1', '0', '1'],
			['1', '1', '1', '0'],
		]);
		const result = checkEliminationStrategy(line);
		expect(result).toEqual({
			found: true,
			data: {
				targets: [
					{ x: 1, y: 0, value: ONE }
				]
			}
		})
	})

	it('should work on a simple line with 1-2 remaining', () => {
		const line = BoardLine.fromValues(['0', '1', '.', '.', '.', '0'], 'A');
		const result = checkEliminationStrategy(line);
		expect(result).toMatchInlineSnapshot(`
			{
			  "data": {
			    "targets": [
			      {
			        "value": "1",
			        "x": 4,
			        "y": 0,
			      },
			    ],
			  },
			  "found": true,
			}
		`);
	})

	it('should work on a line that can be balanced', () => {
		const line = BoardLine.fromValues([
			EMPTY, ZERO, EMPTY, EMPTY, ZERO, ZERO
		], 'A');
		const result = checkEliminationStrategy(line);
		expect(result).toMatchInlineSnapshot(`
			{
			  "data": {
			    "targets": [
			      {
			        "value": "1",
			        "x": 0,
			        "y": 0,
			      },
			      {
			        "value": "1",
			        "x": 2,
			        "y": 0,
			      },
			      {
			        "value": "1",
			        "x": 3,
			        "y": 0,
			      },
			    ],
			  },
			  "found": true,
			}
		`);
	})
})

describe('EliminationStrategy helpers', () => {
	describe('removeFilledLinesFromPermutations', () => {
		it('should remove filled lines from permutations', () => {
			const perms = [
				['0', '1', '0', '1'],
				['1', '0', '1', '0'],
				['0', '0', '1', '1'],
			] as const;
			const filledLines = [
				BoardLine.fromValues(['0', '1', '0', '1'], 'A'),
				BoardLine.fromValues(['1', '0', '1', '0'], 'A'),
			];

			const expected = [
				['0', '0', '1', '1'],
			];

			const result = removeFilledLinesFromPermutations(perms, filledLines).result;
			expect(result).toEqual(expected);
		});

		test('withSources also adds the lineIds that were found to have resulted in a removed line from perms', () => {
			const perms = [
				['0', '1', '0', '1'],
				['1', '0', '1', '0'],
				['0', '0', '1', '1'],
			] as const;
			const filledLines = [
				BoardLine.fromValues(['0', '1', '0', '1'], 'A'),
				BoardLine.fromValues(['1', '0', '1', '0'], '4'),
			];
			const expected = {
				result: [
					['0', '0', '1', '1']
				],
				sources: ['A', '4']
			}
			expect(removeFilledLinesFromPermutationsWithSources(perms, filledLines)).toEqual(expected);
		})

		it('should return the same permutations if no filled lines are provided', () => {
			const perms = [
				['0', '1', '0', '1'],
				['1', '0', '1', '0'],
				['0', '0', '1', '1'],
			] as const;
			const filledLines: BoardLine[] = [];

			const expected = [
				['0', '1', '0', '1'],
				['1', '0', '1', '0'],
				['0', '0', '1', '1'],
			]

			const actual = removeFilledLinesFromPermutations(perms, filledLines).result;

			expect(actual).toEqual(expected);
		});
	});

	describe('getRecurringValuesFromPermutations', () => {
		it('should return all Targets that are empty in the original line, and have the same non-empty value in ALL permutations', () => {
			const boardLine = BoardLine.fromValues(
				['.', '.', '.', '.', '0', '1'],
				'A' // row 0, so y = 0
			);

			const perms = [
				['1', '0', '0', '0', '0', '1'],
				['1', '1', '0', '1', '0', '1'],
			] as const; // the first and third value are the same in every perm

			const expected = [
				{ x: 0, y: 0, value: ONE },
				{ x: 2, y: 0, value: ZERO }
			];
			expect(getRecurringValuesFromPermutations(boardLine, perms)).toEqual(expected);
		})

		it('should work with just a single permutation, filling all empty cells', () => {
			const boardLine = BoardLine.fromValues(
				['1', '.', '.', '.', '0', '1'],
				'A' // row 0, so y = 0
			);
			const perms = [
				['1', '0', '0', '1', '0', '1'],
			] as const;
			const expected = [
				{ x: 1, y: 0, value: ZERO },
				{ x: 2, y: 0, value: ZERO },
				{ x: 3, y: 0, value: ONE },
			];
			expect(getRecurringValuesFromPermutations(boardLine, perms)).toEqual(expected);
		})
	})
})