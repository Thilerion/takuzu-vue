import { ThreesUnit, type ThreesValues } from "@/lib/board/ThreesUnit.js";
import { COLUMN, ROW } from "@/lib/constants.js";
import { SimpleBoard } from "@/lib/board/Board.js";
import type { BoardExportString } from "@/lib/types.js";

describe('ThreesUnit', () => {
	let board6x10: SimpleBoard;
	beforeEach(() => {
		board6x10 = SimpleBoard.import("6x10;1.1.....01.1..0......0..01...0....11........1.0.1.1.......11" as BoardExportString);
	})

	describe('constructor', () => {
		it('works with a board as a horizontal unit', () => {
			const unit = new ThreesUnit(2, 1, ROW, board6x10);
			expect(unit.values).toEqual('01.'.split(''));
			expect(unit.type).toBe(ROW);
			expect(unit.coords).toEqual([
				{ x: 2, y: 1 },
				{ x: 3, y: 1 },
				{ x: 4, y: 1 },
			])
		})

		it('works with a board as a vertical unit', () => {
			const unit = new ThreesUnit(2, 1, COLUMN, board6x10);
			expect(unit.values).toEqual('00.'.split(''));
			expect(unit.type).toBe(COLUMN);
			expect(unit.coords).toEqual([
				{ x: 2, y: 1 },
				{ x: 2, y: 2 },
				{ x: 2, y: 3 },
			])
		})

		it('works with a values array', () => {
			const values = '01.'.split('') as ThreesValues;
			const unit = new ThreesUnit(2, 1, ROW, values);
			expect(unit.values).toEqual('01.'.split(''));
			expect(unit.type).toBe(ROW);
			expect(unit.coords).toEqual([
				{ x: 2, y: 1 },
				{ x: 3, y: 1 },
				{ x: 4, y: 1 },
			])
		})
	})
})