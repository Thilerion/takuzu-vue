import { SimpleBoard } from "@/lib/board/Board.js";
import { ConstraintsHandler } from "@/lib/solvers/logic-solver/helpers/ConstraintsHandler.js";
import type { BaseConstraintSolverConstraintFn } from "@/lib/solvers/logic-solver/types.js";

describe('LogicSolver ConstraintsHandler', () => {
	const _createConstraintFn = (timesChangedTrue: number): BaseConstraintSolverConstraintFn => {
		let i = 0;
		return () => {
			i += 1;
			if (i > timesChangedTrue) {
				return { changed: false };
			}
			return { changed: true };
		}			
	};

	describe('applyConstraints', () => {
		it('runs the supplied constraints until all constraints no longer give changes', () => {
			const constraintA = vi.fn(_createConstraintFn(10));
			const constraintB = vi.fn(_createConstraintFn(10));
			const constraintsHandler = new ConstraintsHandler([constraintA, constraintB]);

			const board = SimpleBoard.empty(4, 4);
			const result = constraintsHandler.applyConstraints(board);
			expect(result).toEqual({ changed: true });

			// A runs 10 times with success, then fails the rest.
			// B then runs 10 times with success (after A has failed 10 times), the fails once to stop running
			expect(constraintA).toHaveBeenCalledTimes(20 + 1); // 10 times success, 10 times fail, 1 final time
			expect(constraintB).toHaveBeenCalledTimes(10 + 1);
		})

		it('only returns changed:false if none of the constraints have ever returned changes', () => {
			const constraintA = vi.fn(_createConstraintFn(0));
			const constraintB = vi.fn(_createConstraintFn(0));
			const constraintsHandler = new ConstraintsHandler([constraintA, constraintB]);

			const board = SimpleBoard.empty(4, 4);
			const result = constraintsHandler.applyConstraints(board);
			expect(result).toEqual({ changed: false });
			expect(constraintA).toHaveBeenCalledTimes(1);
			expect(constraintB).toHaveBeenCalledTimes(1);
		})

		it('stops if a constraint returns an error', () => {
			const constraintA = vi.fn(_createConstraintFn(10));
			const constraintFnB: BaseConstraintSolverConstraintFn = () => ({ error: 'test error', changed: false });
			const constraintB = vi.fn(constraintFnB);
			const constraintC = vi.fn(_createConstraintFn(10));

			const constraintsHandler = new ConstraintsHandler([constraintA, constraintB, constraintC]);
			const board = SimpleBoard.empty(4, 4);
			const result = constraintsHandler.applyConstraints(board);
			expect(result).toEqual({ error: 'test error', changed: false });
			expect(constraintA).toHaveBeenCalledTimes(11);
			expect(constraintB).toHaveBeenCalledTimes(1);
			expect(constraintC).toHaveBeenCalledTimes(0); // was not called, because the error was returned immediately
		})

		test('if isEnabled is false, applyConstraints short-circuits to return { changed: false }', () => {
			const constraintsHandler = new ConstraintsHandler([]);
			const spy = vi.spyOn(constraintsHandler, 'applyConstraintsUntilChangesOrError');
			const board = SimpleBoard.empty(4, 4);
			const result = constraintsHandler.applyConstraints(board);
			expect(result).toEqual({ changed: false });
			expect(spy).not.toHaveBeenCalled();
		})
	})

	describe('construction/initialization', () => {
		test('isEnabled is false if no constraints are provided, and true if there are', () => {
			const constraintsHandler = new ConstraintsHandler([]);
			expect(constraintsHandler.isEnabled).toBe(false);

			const constraintsHandler2 = new ConstraintsHandler([(() => null) as any]);
			expect(constraintsHandler2.isEnabled).toBe(true);
		})

		it('can be constructed from config with "default" constraints', () => {
			const constraintsHandler = ConstraintsHandler.fromConfig({ constraints: 'default' });
			expect(constraintsHandler.isEnabled).toBe(true);
			// @ts-expect-error constraints is private
			expect(constraintsHandler.constraints.length)
				.toBe(ConstraintsHandler.getDefaultConstraints().length);
		})
	
	})
})