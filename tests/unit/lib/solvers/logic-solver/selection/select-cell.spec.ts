import { SimpleBoard } from "@/lib/board/Board.js";
import { selectCellStrategies } from "@/lib/solvers/logic-solver/selection/index.js";
import type { XYKey } from "@/lib/types.js";

describe('DFS cell selection strategies', () => {
	describe('firstEmptyCell', () => {
		it('returns the first empty cell', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'0011',
				'11..',
			]);
			const result = selectCellStrategies.firstEmpty(board);
			expect(result).toEqual({ x: 2, y: 3 });

			board.assign(2, 3, '0');
			expect(selectCellStrategies.firstEmpty(board)).toEqual({ x: 3, y: 3 });
		})

		it('returns null if there are no empty cells', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'0011',
				'1100',
			]);
			expect(selectCellStrategies.firstEmpty(board)).toBeNull();
		})
	})

	describe('fewestEmptyPeersCell', () => {
		it('returns null if there are no empty cells', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'0011',
				'1100',
			]);
			expect(selectCellStrategies.fewestEmptyPeers(board)).toBeNull();
		})

		it('correctly selects the cell with the fewest empty peers', () => {
			const boardA = SimpleBoard.fromArrayOfLines([
				'1...',
				'....',
				'...0', 
				'.11.',// => first cell has fewest empty peers (3)
			]);
			vi.spyOn(boardA, 'getNumEmpty').mockReturnValueOnce(1);
			const result = selectCellStrategies.fewestEmptyPeers(boardA);
			expect(result).toEqual({ x: 0, y: 3 });

			const boardB = SimpleBoard.fromArrayOfLines([
				'..0.',
				'1100',
				'....', // => third cell has fewest empty peers (4)
				'....',
				'..1.',
				'..10',
			]);
			const resultB = selectCellStrategies.fewestEmptyPeers(boardB);
			expect(resultB).toEqual({ x: 2, y: 2 });
		})

		it('returns the first empty cell if there are very many empty cells', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'...1',
				'...1',
				'1...', // => last cell has fewest empty peers
				'...0',
			]);
			const result = selectCellStrategies.fewestEmptyPeers(board);
			expect(result).toEqual({ x: 0, y: 0 });

			// but it returns 3,2 if there percentage of empty cells is lower
			vi.spyOn(board, 'getNumEmpty').mockReturnValueOnce(1);
			expect(selectCellStrategies.fewestEmptyPeers(board)).toEqual({ x: 3, y: 2 });
		})
	})

	describe('randomCell', () => {
		it('randomly returns empty cells', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'....',
				'0110',
				'0011',
				'11..',
			]);
			const resultsSet = new Set<XYKey>();
			for (let i = 0; i < 1000; i++) {
				const result = selectCellStrategies.random(board);
				expect(result).not.toBeNull();
				resultsSet.add(`${result!.x},${result!.y}`);
			}
			expect(resultsSet.size).toBe(6);
			expect([...resultsSet].sort()).toMatchInlineSnapshot(`
				[
				  "0,0",
				  "1,0",
				  "2,0",
				  "2,3",
				  "3,0",
				  "3,3",
				]
			`);
		})

		it('returns null if there are no empty cells', () => {
			const board = SimpleBoard.fromArrayOfLines([
				'1001',
				'0110',
				'0011',
				'1100',
			]);
			expect(selectCellStrategies.random(board)).toBeNull();
		})
	})
})