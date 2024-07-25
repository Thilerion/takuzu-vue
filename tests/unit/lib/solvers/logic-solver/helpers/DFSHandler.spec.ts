import { SimpleBoard } from "@/lib/board/Board.js";
import type { ConstraintResult } from "@/lib/solvers/logic-solver/constraints/types.js";
import { DFSHandler, type DFSResult } from "@/lib/solvers/logic-solver/helpers/DFSHandler.js";
import type { TimeoutChecker } from "@/lib/solvers/logic-solver/helpers/timeout-check.js";
import { selectCellStrategies, selectValueStrategies } from "@/lib/solvers/logic-solver/selection/index.js";
import type { Mock } from "vitest";

describe('LogicSolver DFSHandler', () => {
	let constraintsHandlerMock: { applyConstraints: Mock<[], ConstraintResult> };
	beforeEach(() => {
		constraintsHandlerMock = {
			applyConstraints: vi.fn(() => ({ changed: false } as ConstraintResult))
		}

		vi.useFakeTimers();
	})
	afterEach(() => {
		vi.useRealTimers();
	})

	describe('Initialization and Configuration', () => {		

		it('should initialize correctly', () => {
			const dfsHandler = DFSHandler.fromConfig({
				timeout: 100,
				maxSolutions: 10,
				selectCell: 'fewestEmptyPeers',
				selectValue: 'random'
			}, constraintsHandlerMock);

			expect(dfsHandler).toHaveProperty('constraintsHandler', constraintsHandlerMock);
			expect(dfsHandler.maxSolutions).toBe(10);
			expect(dfsHandler.timeoutChecker).toMatchObject({
				timeoutMs: 100
			})
		});

		it('should only start the timeout timer when the DFS starts', () => {
			const TIMEOUT = 1000;
			const dfsHandler = DFSHandler.fromConfig({
				timeout: TIMEOUT,
				maxSolutions: 2,
				selectCell: 'fewestEmptyPeers',
				selectValue: 'random'
			}, constraintsHandlerMock);

			vi.advanceTimersByTime(TIMEOUT * 2);

			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'0011',
				'11..', // => 1100
			]);
			const onSolutionFound = vi.fn();
			const runResult = dfsHandler.performDFS(board, { onSolutionFound });
			// Timer is advanced by more than timeout, but the solver should finish before the timeout is reached
			expect(runResult).toEqual({
				status: 'done',
				reason: 'finished',
				solutionsFound: 1
			});
			expect(onSolutionFound).toHaveBeenCalledTimes(1);
		})

		it('can be created with a TimeoutChecker instead of a number', () => {
			const timeoutChecker = { reset: () => {} } as any as TimeoutChecker;
			const dfsHandler = DFSHandler.fromConfig({
				timeout: timeoutChecker,
				maxSolutions: 10,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			expect(dfsHandler.timeoutChecker).toBe(timeoutChecker);
		})

	});

	describe('Basic DFS Functionality', () => {

		it('correctly uses selectCell and selectValue strategies during DFS', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'.001', // => 1001
				'0110',
				'0011',
				'11..', // => 1100
			]);
			const onSolutionFound = vi.fn();
			const selectCell = vi.fn(selectCellStrategies.firstEmpty);
			const selectValue = vi.fn(selectValueStrategies.leastConstraining);
			const dfsHandler = DFSHandler.fromConfig({
				timeout: 100,
				maxSolutions: 10,
				selectCell,
				selectValue
			}, constraintsHandlerMock);

			dfsHandler.performDFS(board, { onSolutionFound });
			expect(selectCell).toHaveBeenCalledTimes(3); // once for each empty cell in this case
			expect(selectValue).toHaveBeenCalledTimes(3);
		})

		it('correctly handles an already solved board', () => {
			const boardA = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'0011',
				'1100',
			]);
			const onSolutionFound = vi.fn();
			const dfsHandlerA = DFSHandler.fromConfig({
				timeout: 5_000,
				maxSolutions: 10,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			const runResultA = dfsHandlerA.performDFS(boardA, { onSolutionFound });
			expect(runResultA).toEqual({
				status: 'done',
				reason: 'finished',
				solutionsFound: 1
			});
			expect(onSolutionFound).toHaveBeenCalledTimes(1);

			
		})

		it('solves a simple puzzle correctly', () => {
			const boardB = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'0011',
				'110.',
			]);
			const dfsHandlerB = DFSHandler.fromConfig({
				timeout: 5_000,
				maxSolutions: 10,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			const onSolutionFound = vi.fn();
			const runResultB = dfsHandlerB.performDFS(boardB, { onSolutionFound });
			expect(runResultB).toEqual({
				status: 'done',
				reason: 'finished',
				solutionsFound: 1
			});
			expect(onSolutionFound).toHaveBeenCalledWith(boardB.copy().assign(3, 3, '0'));
		});

		it('does not modify the input board', () => {
			const board = SimpleBoard.empty(4, 4);
			const origBoard = board.copy();
			
			const solutions: SimpleBoard[] = [];
			const onSolutionFound = vi.fn();

			const dfsHandler = DFSHandler.fromConfig({
				timeout: 100,
				maxSolutions: 1,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			dfsHandler.performDFS(board, { onSolutionFound });

			expect(board).toEqual(origBoard);
			expect(solutions[0]).not.toBe(board);
			expect(solutions[0]).not.toEqual(origBoard);
		})
		
		it('finds multiple solutions when they exist', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'0.1.', // => 0110 or 0011
				'0.1.', // => 0110 or 0011
				'1001',
				'1100',
			]);
			const solutions: SimpleBoard[] = []
			const onSolutionFound = vi.fn(b => solutions.push(b));
			const dfsHandler = DFSHandler.fromConfig({
				timeout: 100,
				maxSolutions: 10,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			const runResult = dfsHandler.performDFS(board, { onSolutionFound });
			expect(runResult).toEqual({
				status: 'done',
				reason: 'finished',
				solutionsFound: 2
			});
			expect(onSolutionFound).toHaveBeenCalledTimes(2);
			expect(solutions.map(s => s.export())).toEqual([
				'4x4;0011011010011100',
				'4x4;0110001110011100',
			])
		});
		
		it('returns no solutions for an unsolvable puzzle', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'01.1',
				'1...',
				'0.01',
				'1100',
			]);
			const onSolutionFound = vi.fn();
			const dfsHandler = DFSHandler.fromConfig({
				timeout: 100,
				maxSolutions: 10,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			const runResult = dfsHandler.performDFS(board, { onSolutionFound });
			expect(runResult).toEqual({
				status: 'done',
				reason: 'finished',
				solutionsFound: 0
			});
			expect(onSolutionFound).not.toHaveBeenCalled();
		});

		it('correctly handles an invalid board', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'111.',
				'....',
				'....',
				'....',
			]);
			const onSolutionFound = vi.fn();
			const dfsHandler = DFSHandler.fromConfig({
				timeout: 100,
				maxSolutions: 10,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			const runResult = dfsHandler.performDFS(board, { onSolutionFound });
			expect(runResult).toEqual({
				status: 'done',
				reason: 'finished',
				solutionsFound: 0
			});
		})
		
		it('correctly applies constraints during DFS', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'0011',
				'1...',
			]);
			const onSolutionFound = vi.fn();
			const dfsHandler = DFSHandler.fromConfig({
				timeout: 100,
				maxSolutions: 10,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			dfsHandler.performDFS(board, { onSolutionFound });

			expect(constraintsHandlerMock.applyConstraints).toHaveBeenCalledTimes(6);
		});

	});

	describe('Termination Conditions', () => {

		it('stops when maximum solutions are reached', () => {
			const board = SimpleBoard.empty(4, 4); // has 72 solutions
			const onSolutionFound = vi.fn();

			const dfsHandler = DFSHandler.fromConfig({
				timeout: null,
				maxSolutions: 10,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			const runResult = dfsHandler.performDFS(board, { onSolutionFound });
			expect(runResult).toEqual({
				status: 'done',
				reason: 'max_solutions_reached',
				solutionsFound: 10
			});
			expect(onSolutionFound).toHaveBeenCalledTimes(10);
		});
		
		it('stops when timeout is reached', () => {
			vi.useRealTimers();
			const board = SimpleBoard.empty(4, 4); // has 72 solutions
			const onSolutionFound = vi.fn();
			const dfsHandler = DFSHandler.fromConfig({
				timeout: 5,
				maxSolutions: Infinity,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);
			const runResult = dfsHandler.performDFS(board, { onSolutionFound }) as DFSResult & { status: 'done' };
			expect(runResult).toEqual({
				status: 'done',
				reason: 'timed_out',
				solutionsFound: expect.any(Number)
			});
			expect(runResult.solutionsFound).toBeLessThan(72);
			expect(runResult.solutionsFound).toBeGreaterThan(1);
		});

	});

	describe('Error Handling', () => {

		it('cannot be reused => throws error when starting DFS on a non-idle handler', () => {
			const dfsHandler = DFSHandler.fromConfig({
				timeout: 100,
				maxSolutions: 10,
				selectCell: 'fewestEmptyPeers',
				selectValue: 'random'
			}, constraintsHandlerMock);
			const onSolutionFound = vi.fn();

			const boardA = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'0011',
				'11..', // => 1100
			]);
			const boardB = boardA.copy();

			expect(() => dfsHandler.performDFS(boardA, { onSolutionFound })).not.toThrowError();
			expect(() => dfsHandler.performDFS(boardB, { onSolutionFound })).toThrowError(/has already finished/i);
		});
		
		it.todo('handles errors during DFS execution', () => { });

		it('throws an error when trying to get a result when the DFSHandler is not finished', () => {
			const dfsHandler = DFSHandler.fromConfig({
				timeout: 100,
				maxSolutions: 10,
				selectCell: 'firstEmpty',
				selectValue: 'zeroFirst'
			}, constraintsHandlerMock);

			expect(dfsHandler.getStatus()).toStrictEqual({ status: 'idle' });
			expect(() => dfsHandler.getResult()).toThrowError(/before it has started/i);

			// @ts-expect-error setting private property
			dfsHandler.state.status = 'running';
			expect(() => dfsHandler.getResult()).toThrowError(/still running/i);

			// @ts-expect-error setting private property
			dfsHandler.state.status = 'done';
			expect(() => dfsHandler.getResult()).not.toThrowError();
		})

	});
})