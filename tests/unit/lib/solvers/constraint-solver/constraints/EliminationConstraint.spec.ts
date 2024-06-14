/*
Line size: 10, no duplicate lines
	001....1.0 (2-3) => 3 targets to 001..10110
	1...100100 (1-2) => 3 targets to 1101100100
*/

import { BoardLine } from "@/lib/board/BoardLine.js";
import { ROW, COLUMN, type LineType, ONE } from "@/lib/constants.js";
import { SimpleBoard } from "@/lib/board/Board.js";
import type { EliminationStrategyResult } from "@/lib/solvers/common/EliminationStrategy.js";
import { applyEliminationConstraint, categorizeBoardLines, type ApplyEliminationConstraintValidatedOpts, type ApplyEliminationConstraintOptsParam } from "@/lib/solvers/constraint-solver/constraints/EliminationConstraint.js";
import { type CategorizeBoardLineFn, type PrioritySortBoardLinesFn } from "@/lib/solvers/constraint-solver/constraints/elimination.helpers.js";
import type { PuzzleValueLine, Target } from "@/lib/types.js";
import * as elimStratModule from '@/lib/solvers/common/EliminationStrategy.js';
import { splitLine } from "@/lib/utils/puzzle-line.utils.js";

describe('applyEliminationConstraint', () => {
	let mockableSortNone: PrioritySortBoardLinesFn;
	let emptyFilledLines: Record<LineType, BoardLine[]>;
	beforeEach(() => {
		mockableSortNone = () => 0;
		emptyFilledLines = {
			[ROW]: [],
			[COLUMN]: []
		}
	})
	afterEach(() => {
		vi.restoreAllMocks();
	})
	describe('helper functions/dependencies', () => {
		describe('categorizeBoardLines dependencies', () => {
			it('calls the assignLineCategory dependency for each line in boardLines', () => {
				const boardLines = [
					BoardLine.fromValues(
						splitLine('001....1.0'),
						'A'
					),
					BoardLine.fromValues(
						splitLine('1...100100'),
						'B'
					)
				];
				
				const assignLineCategory = vi.fn((() => 'skip') as CategorizeBoardLineFn);
				const sort = vi.fn(mockableSortNone);
				const deps = { assignLineCategory, sort };

				const opts = {} as ApplyEliminationConstraintValidatedOpts;

				const res = categorizeBoardLines(
					boardLines,
					opts,
					deps
				);

				expect(res).toEqual({
					filledLines: emptyFilledLines,
					boardLines: []
				})

				// assignLineCategory gets called for each boardLine, with the line and the resolved options
				expect(assignLineCategory).toHaveBeenCalledTimes(2);
				expect(assignLineCategory.mock.calls[0]).toEqual([
					boardLines[0],
					opts
				])
				expect(assignLineCategory.mock.calls[1]).toEqual([
					boardLines[1],
					opts
				])
			})

			it('uses the sort dependency to sort the "lines to process" as categorized by the assignLineCategory dependency', () => {
				const boardLines = [
					BoardLine.fromValues(
						splitLine('....'),
						'A'
					),
					BoardLine.fromValues(
						splitLine('....'),
						'B'
					),
					BoardLine.fromValues(
						splitLine('....'),
						'C'
					),
					BoardLine.fromValues(
						splitLine('....'),
						'D'
					)
				];
				const assignLineCategory = vi.fn((() => 'process') as CategorizeBoardLineFn);
				const sort = vi.fn((a: BoardLine, b: BoardLine) => {
					// sorts in reverse order
					const idA = a.lineId.charCodeAt(0);
					const idB = b.lineId.charCodeAt(0);
					return idB - idA;
				})
				const deps = { assignLineCategory, sort };
				const opts = {} as ApplyEliminationConstraintValidatedOpts;

				const res = categorizeBoardLines(
					boardLines,
					opts,
					deps
				);

				expect(res).toEqual({
					filledLines: emptyFilledLines,
					boardLines: [
						boardLines[3],
						boardLines[2],
						boardLines[1],
						boardLines[0]
					] // in reverse order, as done by the "sort" dependency
				})

				// at least 3 sort calls needed to sort these 4 items
				expect(sort.mock.calls.length).toBeGreaterThanOrEqual(3);
			})

			it('correctly categorizes filled lines, grouped by line type', () => {
				const boardLines = [
					BoardLine.fromValues(
						splitLine('1100'),
						'A'
					),
					BoardLine.fromValues(
						splitLine('1100'),
						'B'
					),
					BoardLine.fromValues(
						splitLine('1100'),
						'1'
					),
				];
				const assignLineCategory = vi.fn((() => 'filled') as CategorizeBoardLineFn);
				const sort = vi.fn(mockableSortNone);
				const deps = { assignLineCategory, sort };
				const opts = {} as ApplyEliminationConstraintValidatedOpts;

				const res = categorizeBoardLines(
					boardLines,
					opts,
					deps
				);

				expect(res).toEqual({
					filledLines: {
						[ROW]: [boardLines[0], boardLines[1]],
						[COLUMN]: [boardLines[2]]
					},
					boardLines: []
				})
				// no boardLines, so sort should not be called
				expect(sort).not.toHaveBeenCalled();
			})
		})

		describe('categorizeBoardLines defaults', () => {
			test.todo('filled lines are skipped if useDuplicateLines is false');
			test.todo('lines are only processed if in min/max range for leastRemaining');
			test.todo('lines are skipped if numEmpty > maxEmptyCells');
			test.todo('lines are skipped if no cells in a line are filled');

			test.todo('priority sort sorts by difference in leastRemaining, then by difference in mostRemaining');
		})

		test('gatherBoardLines dependency is used, regardless of which board is passed into the function itself', () => {
			const board = SimpleBoard.empty(4, 4); // would return 8 empty lines, and no result would be found
			const gatherBoardLines = vi.fn(() => [BoardLine.fromValues(
				splitLine('11.0'), // a result WOULD be found here
				'A'
			)])
			const assignLineCategory = vi.fn((() => 'process') as CategorizeBoardLineFn);
			// Note: There will be a problem when lines get reset after a value was assigned to them, as the cached values will be incorrect after they have received the board values
			const deps = { gatherBoardLines, assignLineCategory };
			const opts: ApplyEliminationConstraintOptsParam = {
				singleAction: false,
				useDuplicateLines: false,
			}
			const result = applyEliminationConstraint(board, opts, deps);
			expect(gatherBoardLines).toHaveBeenCalledTimes(1);
			expect(gatherBoardLines).toHaveBeenCalledWith(board);
			expect(assignLineCategory).toHaveBeenCalledTimes(1);
			expect(assignLineCategory).toHaveBeenCalledWith(
				expect.objectContaining({
					lineId: 'A'
				}),
				expect.anything()
			)
			expect(result).toEqual({ changed: true });
		})
	})

	describe('applyEliminationConstraint', () => {
		let grid4x4: PuzzleValueLine[];
		beforeEach(() => {
			grid4x4 = ([
				'.011',
				'..1.',
				'..0.',
				'10..'
			] as const).map(l => splitLine(l));
		})
		it('returns false if there are no lines to process', () => {
			const board = SimpleBoard.empty(4, 4);
			const opts: ApplyEliminationConstraintOptsParam = {
				singleAction: false,
				useDuplicateLines: false,
				leastRemainingRange: [0, Infinity],
				maxEmptyCells: Infinity
			}
			const assignLineCategory: CategorizeBoardLineFn = () => 'skip'; // skips all so no lines to process
			const deps = { assignLineCategory };

			expect(applyEliminationConstraint(board, opts, deps)).toEqual({
				changed: false
			})
		})

		it('returns an error object if a line has no possible completions', () => {
			const board = SimpleBoard.empty(4, 4);
			board.assignRow(0, splitLine('111.'));
			const opts: ApplyEliminationConstraintOptsParam = {
				singleAction: false,
				useDuplicateLines: false,
				leastRemainingRange: [0, Infinity],
				maxEmptyCells: Infinity
			}
			const assignLineCategory: CategorizeBoardLineFn = () => 'process'; // processes all lines
			const deps = { assignLineCategory };

			const res = applyEliminationConstraint(board, opts, deps);
			expect(res).toEqual({
				changed: false,
				error: expect.any(String)
			})
			expect(res.error).toMatchInlineSnapshot(`"No valid permutations found"`);
		})

		it('returns the error object if checkEliminationStrategy returns an error', () => {
			const mockedElimStrat = vi.spyOn(elimStratModule, 'checkEliminationStrategy').mockImplementation((): Extract<EliminationStrategyResult, { invalid: true }> => {
				return {
					error: 'test error',
					found: false,
					invalid: true
				}
			})

			const board = SimpleBoard.empty(4, 4);
			board.assignRow(0, splitLine('11..')); // needed so there are lines to process
			const res = applyEliminationConstraint(board, {
				singleAction: false,
				useDuplicateLines: false,
				leastRemainingRange: [0, Infinity],
				maxEmptyCells: Infinity
			});
			expect(mockedElimStrat.mock.calls).toHaveLength(1);
			expect(res).toEqual({
				changed: false,
				error: 'test error'
			})
		})

		it('returns (true) after the first strategy result if singleAction option is true', () => {
			const mockedElimStrat = vi
				.spyOn(elimStratModule, 'checkEliminationStrategy')
				.mockReturnValueOnce({
					found: false,
				})
				.mockReturnValueOnce({
					found: true,
					data: {
						targets: [
							{ x: 0, y: 0, value: ONE}
						]
					}
				})
				.mockReturnValue({
					found: true,
					data: {
						targets: []
					}
				});

			const board = new SimpleBoard(grid4x4);
			const res = applyEliminationConstraint(board, {
				singleAction: true,
				useDuplicateLines: false,
				leastRemainingRange: [0, Infinity],
				maxEmptyCells: Infinity
			});
			
			expect(res).toEqual({ changed: true });
			expect(mockedElimStrat).toHaveBeenCalledTimes(2); // 2 times, because after the first two strategy calls, a result is found
		});

		it('keeps checking all lines to process if singleAction is false, even if a strategy result is found', () => {
			const mockedElimStrat = vi
				.spyOn(elimStratModule, 'checkEliminationStrategy')
				.mockReturnValueOnce({
					found: false,
				})
				.mockReturnValueOnce({
					found: true,
					data: {
						targets: [
							{ x: 0, y: 0, value: ONE}
						]
					}
				})
				.mockReturnValue({
					found: true,
					data: {
						targets: []
					}
				});

			const board = new SimpleBoard(grid4x4);
			const res = applyEliminationConstraint(board, {
				singleAction: false, // singleAction is false
				useDuplicateLines: false,
				leastRemainingRange: [0, Infinity],
				maxEmptyCells: Infinity
			});
			
			expect(res).toEqual({ changed: true });
			expect(mockedElimStrat).toHaveBeenCalledTimes(8); // 8 times; for each boardLine to process
		})
		
		it('returns false if no strategy results are found', () => {
			const mockedElimStrat = vi.spyOn(elimStratModule, 'checkEliminationStrategy').mockImplementation((): Extract<EliminationStrategyResult, { found: false }> => {
				return {
					found: false,
				}
			})
			const board = new SimpleBoard(grid4x4);
			const res = applyEliminationConstraint(board, {
				singleAction: false,
				useDuplicateLines: false,
				leastRemainingRange: [0, Infinity],
				maxEmptyCells: Infinity
			});
			expect(mockedElimStrat.mock.calls).toHaveLength(8); // all rows and columns have a value, so all get processed
			expect(res).toEqual({
				changed: false
			})
		});

		it('applies only the first strategy result and then returns true if singleAction is true', () => {
			const testTarget: Target = { x: 1, y: 1, value: ONE };
			const mockedElimStrat = vi.spyOn(elimStratModule, 'checkEliminationStrategy')
				.mockReturnValueOnce({
					found: true,
					data: {
						targets: [ testTarget ]
					}
				})
			const board = new SimpleBoard(grid4x4);
			expect(board.get(1, 1)).not.toBe(ONE);
			const res = applyEliminationConstraint(board, {
				singleAction: true,
				useDuplicateLines: false,
				leastRemainingRange: [0, Infinity],
				maxEmptyCells: Infinity
			});
			expect(res).toEqual({
				changed: true
			})
			expect(mockedElimStrat).toHaveBeenCalledTimes(1);
			expect(board.get(1, 1)).toBe(ONE);
		});

		it.todo('applies all strategy results if singleAction is false, and returns true');

		it.todo('correctly updates the boardLines, when an applied strategy result affects other boardLines');

		it.todo('does not account for filledLines if "useDuplicateLines" option is set to false');

		it('correctly updates the filledLines with the processed line, and accounts for them in the next iterations, when an applied strategy result affects other boardLines', () => {
			const grid = ([
				'....',
				'101.', // gets processed first, then added to filledLines, so the rest get called with filledLines[ROW].length === 1
				'....',
				'1..0',
			] as const).map(l => splitLine(l));
			const board = new SimpleBoard(grid);

			const mockedElimStrat = vi.spyOn(elimStratModule, 'checkEliminationStrategy');

			applyEliminationConstraint(board, {
				singleAction: false,
				useDuplicateLines: true, // set to true
				leastRemainingRange: [0, Infinity],
				maxEmptyCells: Infinity
			}, {
				sortLinesByPriority: (a, b) => {
					// rows 1-4 first, then cols 1-4
					if (a.type === ROW && b.type === COLUMN) return -1;
					else if (a.type === COLUMN && b.type === ROW) return 1;
					
					return a.index - b.index;
				}
			});

			expect(mockedElimStrat).toHaveBeenNthCalledWith(1,
				expect.objectContaining({
					lineId: 'B'
				}),
				[]
			);
			expect(mockedElimStrat).toHaveBeenNthCalledWith(2,
				expect.objectContaining({
					lineId: 'D'
				}),
				[expect.objectContaining({
					lineId: 'B'
				})]	
			); // second call has row B in its filledLines, as it has now become a filled line
		})

		it('also solves triples with the correct options', () => {
			const board = SimpleBoard.empty(8, 8);
			board.assignRow(2, splitLine('..11..0.'));

			const result = applyEliminationConstraint(board, {
				singleAction: false,
				useDuplicateLines: false,
				leastRemainingRange: [0, 10],
				maxEmptyCells: Infinity
			});

			expect(result.changed).toBe(true);

			const resultingLine = board.getRow(2);
			expect(resultingLine.join('')).toBe('.011010.');
		})

		it.todo('Not yet implemented; correctly updates the filledLines with other lines that became filled, when an applied strategy result affects other boardLines');
	})

	describe.todo('applyEliminationConstraint end results');
})