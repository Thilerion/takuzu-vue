import { BoardLine } from "@/lib/board/BoardLine.js";
import { SimpleBoard } from "@/lib/index.js";
import { applyLineBalanceConstraint } from "@/lib/solvers/constraint-solver/constraints/LineBalanceConstraint.js";
import type { PuzzleValueLine } from "@/lib/types.js";
import * as lineBalStratModule from '@/lib/solvers/common/LineBalanceStrategy.js';
import { ONE, ZERO } from "@/lib/constants.js";

const splitToPuzzleValueLine = (str: string) => str.split('') as PuzzleValueLine;

describe('applyLineBalanceConstraint', () => {
	afterEach(() => vi.restoreAllMocks() as any);

	it('uses the gatherBoardLines dependency to iterate over the boardLines', () => {
		const mockGatherBoardLines = vi.fn(() => {
			return [
				BoardLine.fromValues(splitToPuzzleValueLine('1..1'), 'A'),
				BoardLine.fromValues(splitToPuzzleValueLine('..1.'), 'B'),
				BoardLine.fromValues(splitToPuzzleValueLine('.0.0'), 'C'),
			]
		});
		const board = SimpleBoard.empty(4, 4); // Empty, so would result in no changes
		const res = applyLineBalanceConstraint(board, {
			singleAction: false
		}, { gatherBoardLines: mockGatherBoardLines });

		expect(mockGatherBoardLines).toHaveBeenCalledWith(board);
		// expect changed true, because the mockGatherBoardLines returns a boardLine that would result in a change
		expect(res).toEqual({ changed: true });
	});

	it('correctly assigns the results of checkLineBalanceStrategy2 to the board', () => {
		const board = SimpleBoard.empty(4, 4);
		vi.spyOn(lineBalStratModule, 'checkLineBalanceStrategy2')
			.mockReturnValueOnce({ found: true, data: { value: ZERO } })
			.mockReturnValueOnce({ found: true, data: { value: ONE } })
			.mockReturnValue({ found: false }); // would make the first two lines be assigned 0000, and 1111
		const deps = {
			gatherBoardLines: vi.fn(() => [
				BoardLine.fromValues(splitToPuzzleValueLine('...1'), 'B'),
				BoardLine.fromValues(splitToPuzzleValueLine('..1.'), '3'),
			])
		}
		const assignSpy = vi.spyOn(board, 'assignLine');
		applyLineBalanceConstraint(board, { singleAction: false }, deps);

		expect(`\n${board.toDisplayString()}\n`).toMatchInlineSnapshot(`
			"
			..1.
			0011
			..1.
			..1.
			"
		`);
		expect(assignSpy).toHaveBeenCalledTimes(2);
		expect(assignSpy).toHaveBeenNthCalledWith(1, 'B', '0001'.split(''));
		expect(assignSpy).toHaveBeenNthCalledWith(2, '3', '1111'.split(''));
	})

	it('returns { changed: true } after the first successful application if singleAction is true', () => {
		const board = SimpleBoard.empty(4, 4);
		// potentialy finds a result twice, but if singleAction is true, it should stop after the first
		const stratMock = vi.spyOn(lineBalStratModule, 'checkLineBalanceStrategy2')
			.mockReturnValueOnce({ found: false })
			.mockReturnValueOnce({ found: true, data: { value: ZERO } })
			.mockReturnValueOnce({ found: true, data: { value: ONE } })
			.mockReturnValue({ found: false });

		const res = applyLineBalanceConstraint(board, { singleAction: true });
		expect(res).toEqual({ changed: true });

		expect(stratMock).toHaveBeenCalledTimes(2);
		expect(stratMock).toHaveLastReturnedWith({ found: true, data: { value: ZERO } });
	})

	it('returns { changed: true } after all lines have been checked, and at least one had a result, if singleAction is false', () => {
		const board = SimpleBoard.empty(4, 4);
		// finds a result twice
		const stratMock = vi.spyOn(lineBalStratModule, 'checkLineBalanceStrategy2')
			.mockReturnValueOnce({ found: false })
			.mockReturnValueOnce({ found: true, data: { value: ZERO } })
			.mockReturnValueOnce({ found: true, data: { value: ONE } })
			.mockReturnValue({ found: false });

		const res = applyLineBalanceConstraint(board, { singleAction: false });
		expect(res).toEqual({ changed: true });

		expect(stratMock).toHaveBeenCalledTimes(4 + 4); // number of boardLines
	})

	it('returns { changed: false } if no successful application was found', () => {
		const board = SimpleBoard.empty(4, 4);
		vi.spyOn(lineBalStratModule, 'checkLineBalanceStrategy2')
			.mockReturnValue({ found: false });

		const resSingle = applyLineBalanceConstraint(board, {
			singleAction: true
		});
		expect(resSingle).toEqual({ changed: false });

		const resMulti = applyLineBalanceConstraint(board, {
			singleAction: false
		});
		expect(resMulti).toEqual({ changed: false });
	})
})