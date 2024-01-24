import { BoardLine } from "@/lib/board/BoardLine.js";
import { ZERO, ONE } from "@/lib/constants.js";
import { checkLineBalanceStrategy2 } from "@/lib/solvers/common/LineBalanceStrategy.js";

const asMockLine = (remaining: [zero: number, one: number]) => {
	return {
		isFilled: remaining[0] === 0 && remaining[1] === 0,
		countRemaining: {
			[ZERO]: remaining[0],
			[ONE]: remaining[1]
		}
	} as BoardLine;
}

describe("checkLineBalanceStrategy2", () => {
	it("should return found: false if no symbols remaining/line is filled", () => {
		const boardLine = asMockLine([0, 0])
		const result = checkLineBalanceStrategy2(boardLine);
		expect(result).toEqual({
			found: false
		});
	});

	it("should return the value ZERO when remainingOne is 0, remainingZero > 0", () => {
		const boardLine = asMockLine([1, 0]);
		const result = checkLineBalanceStrategy2(boardLine);
		expect(result).toEqual({ found: true, data: { value: ZERO } });
	});

	it("should return the value ONE when remainingZero is 0, remainingOne > 0", () => {
		const boardLine = asMockLine([0, 5]);
		const result = checkLineBalanceStrategy2(boardLine);
		expect(result).toEqual({ found: true, data: { value: ONE } });
	});

	it("should return found: false if both 1 and 0 can still be placed", () => {
		const boardLine = asMockLine([1, 2]);
		const result = checkLineBalanceStrategy2(boardLine);
		expect(result).toEqual({ found: false });
	});

	it('should returns found: false if countRemaining is lower than 0; as this strategy does not check for invalidity errors', () => {
		const boardLine = asMockLine([-1, 2]);
		const result = checkLineBalanceStrategy2(boardLine);
		expect(result).toEqual({ found: false });
	})
});