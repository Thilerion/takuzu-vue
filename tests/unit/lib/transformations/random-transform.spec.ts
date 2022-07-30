import { describe, test, expect } from "vitest";
import { generateRandomRepeatingSequence } from '../../../../src/lib/helpers/transform/random-transform';

describe('generateRandomRepeatingSequence', () => {
	test('is returns correct values multiple times', () => {
		const arr = [0, 1, 2, 3, 4];
		const fn = generateRandomRepeatingSequence(arr);
		const results: number[] = [];
		for (let i = 0; i < 20; i++) {
			results.push(fn.next().value as number);
		}
		expect(results).toHaveLength(20);
		expect(results.every(val => arr.includes(val))).toBe(true);
	})

	test('has no repeats', () => {
		const arr = [1, 2, 3, 4, 5, 6, 7, 8];
		const fn = generateRandomRepeatingSequence(arr, [0]);
		let previous = 0;
		for (let i = 0; i < 1000; i++) {
			const next = fn.next().value as number;
			expect(next).not.toBe(previous);
			previous = next;
		}
	})

	test('has no repeats multiple in a row', () => {
		const arr = [1, 2, 3, 4, 5];
		const fn = generateRandomRepeatingSequence(arr, [0]);
		const previous = [0]
		for (let i = 0; i < 1000; i++) {
			const next = fn.next().value as number;
			expect(next).not.toBe(previous);
			previous.push(next);
			const prevSet = [...new Set(previous)];
			expect(prevSet).toHaveLength(previous.length);
			if (previous.length > 3) {
				previous.shift();
			}
		}
	})
})