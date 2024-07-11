import { BoardPreset, MAX_DIFFICULTY_KEY, MIN_DIFFICULTY_KEY, isDifficultyKey, isDimensionStr } from "@/config.js"

describe('BoardPreset', () => {
	it('correctly determines type of the board on construction', () => {
		const presetSquare = new BoardPreset(6, 6, 3);
		expect(presetSquare.type).toBe('Normal');
		expect(presetSquare.isRect).toBe(false);
		expect(presetSquare.isOdd).toBe(false);
		expect(presetSquare.isNormal).toBe(true);

		const presetRect = new BoardPreset(6, 10, 3);
		expect(presetRect.type).toBe('Rectangular');
		expect(presetRect.isRect).toBe(true);
		expect(presetRect.isOdd).toBe(false);
		expect(presetRect.isNormal).toBe(false);

		const presetOdd = new BoardPreset(7, 7, 3);
		expect(presetOdd.type).toBe('Odd');
		expect(presetOdd.isRect).toBe(false);
		expect(presetOdd.isOdd).toBe(true);
		expect(presetOdd.isNormal).toBe(false);
	})

	it('has a numCells property', () => {
		expect(new BoardPreset(6, 6, 3).numCells).toBe(6 * 6);
		expect(new BoardPreset(4, 9, 3).numCells).toBe(4 * 9);
	})
})

describe('difficultyKey related code', () => {
	test('MIN_DIFFICULTY_KEY and MAX_DIFFICULTY_KEY are correct DifficultyKeys', () => {
		expect(MIN_DIFFICULTY_KEY).toBe(1);
		expect(MAX_DIFFICULTY_KEY).toBe(5);
	})

	test('isDifficultyKey() returns true for valid difficulty keys', () => {
		expect(isDifficultyKey(1)).toBe(true);
		expect(isDifficultyKey(2)).toBe(true);
		expect(isDifficultyKey(3)).toBe(true);
		expect(isDifficultyKey(4)).toBe(true);
		expect(isDifficultyKey(5)).toBe(true);
	})
	test('isDifficultyKey() returns false for stringified DifficultyKeys', () => {
		expect(isDifficultyKey('1')).toBe(false);
		expect(isDifficultyKey('4')).toBe(false);
	})
})

describe('config-related functions', () => {
	describe('isDimensionStr', () => {
		it('returns true for strings of form "number"x"number"', () => {
			expect(isDimensionStr('10x20')).toBe(true);
			expect(isDimensionStr('1x2')).toBe(true);
			expect(isDimensionStr('0x0')).toBe(true);
			expect(isDimensionStr('10x012345678')).toBe(true);
		})
	})
})