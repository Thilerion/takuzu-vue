import { SimpleBoard } from "@/lib/board/Board.js";
import type { ConstraintResult } from "@/lib/solvers/logic-solver/constraints/types.js";
import { DFSHandler } from "@/lib/solvers/logic-solver/helpers/DFSHandler.js";
import type { Mock } from "vitest";

describe('LogicSolver DFSHandler', () => {
	describe('Initialization and Configuration', () => {

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
		
	});

	describe('Basic DFS Functionality', () => {

		it.todo('solves a simple puzzle correctly', () => { });
		
		it.todo('finds multiple solutions when they exist', () => { });
		
		it.todo('returns no solutions for an unsolvable puzzle', () => { });
		
		it.todo('correctly applies constraints during DFS', () => { });
		
		it.todo('handles constraint application errors', () => { });
		
	});

	describe('Termination Conditions', () => {

		it.todo('stops when maximum solutions are reached', () => { });
		
		it.todo('stops when timeout is reached', () => { });

		it.todo('completes search when neither max solutions nor timeout is reached', () => { });
		
	});

	describe('Error Handling', () => {

		it.todo('throws error when starting DFS on a non-idle handler', () => { });
		
		it.todo('handles errors during DFS execution', () => { });
		
	});

	describe('Result Reporting', () => {

		it.todo('returns correct DFSResult for successful completion', () => { });
		
		it.todo('returns correct DFSResult for timeout', () => { });
		
		it.todo('returns correct DFSResult for max solutions reached', () => { });
		
		it.todo('returns correct DFSResult for error conditions', () => { });
		
	});
})