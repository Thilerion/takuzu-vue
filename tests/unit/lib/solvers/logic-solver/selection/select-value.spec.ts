import { SimpleBoard } from "@/lib/board/Board.js";
import { ONE, ZERO } from "@/lib/constants.js";
import { selectValueStrategies } from "@/lib/solvers/logic-solver/selection/index.js";

describe('DFS value selection strategies', () => {
	describe('zeroFirstValue', () => {
		it('always returns 0', () => {
			expect(selectValueStrategies.zeroFirst({} as any as SimpleBoard, 0, 0)).toBe(ZERO);
		})
	})

	describe('randomValue', () => {
		it('always randomly returns 0 or 1', () => {
			const results = {
				'0': 0,
				'1': 0,
			}
			for (let i = 0; i < 1000; i++) {
				const result = selectValueStrategies.random({} as any as SimpleBoard, 0, 0);
				results[result] += 1;
			}
			expect(results['0']).toBeGreaterThan(450);
			expect(results['1']).toBeGreaterThan(450);

			expect(results['0']).toBeLessThan(550);
			expect(results['1']).toBeLessThan(550);

			expect(results['0'] + results['1']).toBe(1000);
		})
	})

	describe('leastConstrainingValue', () => {
		it('returns the least constraining value, i.e. the one that has the highest change of being correct', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1...',
				'1...',
				'....',
				'.0..',
			]);
			// 0,3 has 2 ones, and 1 zero, so zero is the least constraining value
			expect(selectValueStrategies.leastConstraining(board, 0, 3)).toBe(ZERO);
			// 2,0 has 1 one, and no zeros, so zero is the least constraining value
			expect(selectValueStrategies.leastConstraining(board, 2, 0)).toBe(ZERO);
			
		})

		test('ONE is chosen as tiebreaker due to odd boards existing (to simplify the function)', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1...',
				'1...',
				'....',
				'.0..',
			]);
			// 1,0 has 1 one, and 1 zero, so we pick one; simply because odd boards exist and then one is needed more
			expect(selectValueStrategies.leastConstraining(board, 1, 0)).toBe(ONE);
			// 3,2 has no ones, and no zeros, so we pick one
			expect(selectValueStrategies.leastConstraining(board, 3, 2)).toBe(ONE);
		})
	})
})