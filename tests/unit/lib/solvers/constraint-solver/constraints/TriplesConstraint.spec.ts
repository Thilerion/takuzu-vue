import type { ThreesCoords, ThreesValues } from "@/lib/board/ThreesUnit.js";
import { EMPTY, ONE, ZERO } from "@/lib/constants.js";
import { SimpleBoard } from "@/lib/index.js";
import { applyTriplesConstraint } from "@/lib/solvers/constraint-solver/constraints/TriplesConstraint.js";
import * as triplesStratModule from '@/lib/solvers/common/TriplesStrategy.js';

describe('applyTriplesConstraint', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	})
	it('uses the gatherThreesUnits dependency to iterate over the threesUnits', () => {
		const mockGatherThreesUnits = vi.fn(() => {
			return [
				{
					coords: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] as ThreesCoords,
					values: [ONE, EMPTY, ONE] as ThreesValues
				}
			]
		});
        const board = SimpleBoard.empty(4, 4); // Empty, so would result in no changes
        const res = applyTriplesConstraint(board, {
			singleAction: false
		}, { gatherThreesUnits: mockGatherThreesUnits });

        expect(mockGatherThreesUnits).toHaveBeenCalledWith(board);
		// expect changed true, because the mockGatherThreesUnits returns a threesUnit that would result in a change
		expect(res).toEqual({ changed: true });
	});

	it('uses the checkTriplesStrategy function to check each threesUnit', () => {
		const mockedTriplesStrat = vi.spyOn(triplesStratModule, 'checkTriplesStrategy2');
		const board = SimpleBoard.empty(4, 4);
		const numThreesUnits = [...board.threesUnits()].length;

		applyTriplesConstraint(board, {
			singleAction: false
		});

		expect(mockedTriplesStrat).toHaveBeenCalledTimes(numThreesUnits);
	});

	it('applies the result of checkTriplesStrategy2 to the board, and returns { changed: true }', () => {
		const board = SimpleBoard.empty(4, 4);
		const assignSpy = vi.spyOn(board, 'assignTarget');
		const mockedTriplesStrat = vi
			.spyOn(triplesStratModule, 'checkTriplesStrategy2')
			.mockReturnValueOnce({
				found: true,
				data: {
					target: { x: 0, y: 0, value: ZERO },
					type: 'double',
					origin: [] as any
				}
			})
			.mockReturnValueOnce({
				found: true,
				data: {
					target: { x: 3, y: 3, value: ZERO },
					type: 'sandwich',
					origin: [] as any
				}
			})
			.mockReturnValue({
				found: false
			});

		const res = applyTriplesConstraint(board, {
			singleAction: false
		});

		expect(res).toEqual({ changed: true });
		expect(mockedTriplesStrat.mock.calls.length).toBe(16);

		expect(assignSpy).toHaveBeenCalledTimes(2);

		expect(assignSpy).toHaveBeenNthCalledWith(1, { value: ZERO, x: 0, y: 0 });
		expect(assignSpy).toHaveBeenNthCalledWith(2, { value: ZERO, x: 3, y: 3 });
	});

	it('returns { changed: true } after the first successful application if singleAction is true', () => {
		const board = SimpleBoard.empty(4, 4);
		const assignSpy = vi.spyOn(board, 'assignTarget');
		// potentially returns two "found" results, but because singleAction is true, should only be called twice
		const mockedTriplesStrat = vi
			.spyOn(triplesStratModule, 'checkTriplesStrategy2')
			.mockReturnValueOnce({
				found: false // first call, no result
			})
			.mockReturnValueOnce({
				// second call, found a result, should not be called again if singleAction is true
				found: true,
				data: {
					target: { x: 0, y: 0, value: ZERO },
					type: 'double',
					origin: [] as any
				}
			})
			.mockReturnValueOnce({
				found: true,
				data: {
					target: { x: 3, y: 3, value: ZERO },
					type: 'sandwich',
					origin: [] as any
				}
			});

		const res = applyTriplesConstraint(board, {
			singleAction: true
		});
		expect(res).toEqual({ changed: true });
		expect(mockedTriplesStrat).toHaveBeenCalledTimes(2);
		expect(assignSpy).toHaveBeenCalledOnce();
		expect(assignSpy).toHaveBeenLastCalledWith({ value: ZERO, x: 0, y: 0 });
	});

	it('returns { changed: false } if no successful application was found', () => {
		const board = SimpleBoard.empty(4, 4);
		board.assignRow(1, [ZERO, ONE, ZERO, EMPTY]);

		const resSingle = applyTriplesConstraint(board, {
			singleAction: true
		});
		expect(resSingle).toEqual({ changed: false });

		const resMulti = applyTriplesConstraint(board, {
			singleAction: false
		});
		expect(resMulti).toEqual({ changed: false });
	});
})