import { SimpleBoard } from "@/lib/board/Board.js";
import { applyLineBalanceConstraint } from "@/lib/solvers/constraint-solver/constraints/LineBalanceConstraint.js";
import { applyTriplesConstraint } from "@/lib/solvers/constraint-solver/constraints/TriplesConstraint.js";
import { solve } from "@/lib/solvers/unified-solver/solve.js";
import type { ConstraintStrategy } from "@/lib/solvers/unified-solver/types.js";

const toStrategy = (fn: (board: SimpleBoard) => { changed: boolean; error?: string | null }): ConstraintStrategy => {
	return (board) => {
		const res = fn(board);
		if (res.error != null) {
			return {
				changed: false,
				invalid: true,
				message: res.error,
			};
		}
		return {
			changed: res.changed,
		};
	};
};

describe('unified solver', () => {
	it('returns unsolvable_invalid for invalid input board', () => {
		const board = SimpleBoard.fromArrayOfLines([
			'...1',
			'...1',
			'...1',
			'....',
		]);

		const result = solve(board, {
			constraints: { enabled: true, strategies: [] },
			dfs: { enabled: true, maxSolutions: 1, timeout: 2000 },
		});

		expect(result.status).toBe('unsolvable_invalid');
		expect(result.stoppedAfter).toBe('initial_check');
	});

	it('solves a board with DFS', () => {
		const board = SimpleBoard.fromArrayOfLines([
			'1..1',
			'1...',
			'..0.',
			'....',
		]);

		const result = solve(board, {
			constraints: { enabled: true, strategies: [] },
			dfs: { enabled: true, maxSolutions: Infinity, timeout: 2000 },
		});

		expect(result.status).toBe('solved');
		if (result.status !== 'solved') return;
		expect(result.solutions).toContain('4x4;1001101001010110');
	});

	it('returns incomplete with reason max_solutions', () => {
		const board = SimpleBoard.fromArrayOfLines([
			'1001',
			'0110',
			'....',
			'....',
		]);

		const result = solve(board, {
			constraints: { enabled: true, strategies: [] },
			dfs: { enabled: true, maxSolutions: 2, timeout: 2000 },
		});

		expect(result.status).toBe('incomplete');
		if (result.status !== 'incomplete') return;
		expect(result.reason).toBe('max_solutions');
		expect(result.solutions).toHaveLength(2);
	});

	it('returns unsolvable_partial when DFS is disabled and constraints cannot fully solve', () => {
		const board = SimpleBoard.fromArrayOfLines([
			'0.11..',
			'0.....',
			'..1...',
			'11..1.',
			'.1.1..',
			'1..0..',
		]);
		const boardExport = board.export();

		const result = solve(board, {
			constraints: {
				enabled: true,
				strategies: [toStrategy(applyLineBalanceConstraint), toStrategy(applyTriplesConstraint)],
			},
			dfs: { enabled: false },
		});

		expect(result.status).toBe('unsolvable_partial');
		if (result.status !== 'unsolvable_partial') return;
		expect(result.partialBoard).not.toBe(boardExport);
	});
});
