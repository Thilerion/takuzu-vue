import type { GridTransformationId } from "@/lib/helpers/transform";
import { describe, test, expect, it } from "vitest";
import { generateRandomRepeatingSequence, getRandomTransformationId } from '../../../../src/lib/helpers/transform/random-transform';

describe('getRandomTransformationId', () => {
	describe('for square board', () => {
		test('it never returns the identity transform without explicitly including it', () => {
			const getId = () => getRandomTransformationId('square');
			const idSet = new Set();
			for (let i = 0; i < 200; i++) {
				idSet.add(getId());
			}
			expect(idSet.size).toBe(15);
			expect(idSet.has('rotate0')).toBe(false);
		})

		test('it can return identity transform if explicitly included', () => {
			let foundRotate0 = false;
			for (let i = 0; i < 200; i++) {
				const id = getRandomTransformationId('square', {
					excludeIdentity: false
				})
				if (id === 'rotate0') {
					foundRotate0 = true;
					break;
				}
			}
			expect(foundRotate0).toBe(true);
		})

		it('respects excluded ids', () => {
			const excludedA: GridTransformationId[] = ['rotate180_invertSymbols', 'rotate180_reflect', 'rotate180_reflect_invertSymbols'];
			const excludedB: GridTransformationId[] = [...excludedA, 'rotate0', 'rotate180'];

			const resultA = new Set();
			for (let i = 0; i < 200; i++) {
				resultA.add(getRandomTransformationId('square', {
					exclude: excludedA,
					excludeIdentity: false
				}))
			}
			expect(resultA.size).toBe(16 - excludedA.length);
			for (const excludedId of excludedA) {
				expect(resultA.has(excludedId)).toBe(false);
			}

			const resultB = new Set();
			for (let i = 0; i < 200; i++) {
				resultB.add(getRandomTransformationId('square', {
					exclude: excludedB,
					excludeIdentity: false
				}))
			}
			expect(resultB.size).toBe(16 - excludedB.length);
			for (const excludedId of excludedB) {
				expect(resultB.has(excludedId)).toBe(false);
			}
		})
	})

	describe('for rectangular board', () => {
		it('returns 8 possible ids if rotate0 included', () => {
			const results = new Set<GridTransformationId>();
			for (let i = 0; i < 100; i++) {
				results.add(getRandomTransformationId('rect', {
					excludeIdentity: false
				}));
			}
			expect(results.size).toBe(8);
			const hasQuarterRotation = [...results].some(val => {
				return val.includes('rotate90') || val.includes('rotate270');
			})
			expect(hasQuarterRotation).toBe(false);
		})
		it('returns 7 possible ids if rotate0 not included', () => {
			const results = new Set<GridTransformationId>();
			for (let i = 0; i < 100; i++) {
				results.add(getRandomTransformationId('rect'));
			}
			expect(results.size).toBe(7);
			expect(results.has('rotate0')).toBe(false);
		})
	})

	describe('for odd board', () => {
		it('returns 8 possible ids if rotate0 included', () => {
			const results = new Set<GridTransformationId>();
			for (let i = 0; i < 100; i++) {
				results.add(getRandomTransformationId('odd', {
					excludeIdentity: false
				}));
			}
			expect(results.size).toBe(8);
			const hasInvertSymbols = [...results].some(val => {
				return val.includes('invertSymbols');
			})
			expect(hasInvertSymbols).toBe(false);
		})
		it('returns 7 possible ids if rotate0 not included', () => {
			const results = new Set<GridTransformationId>();
			for (let i = 0; i < 100; i++) {
				results.add(getRandomTransformationId('odd'));
			}
			expect(results.size).toBe(7);
			expect(results.has('rotate0')).toBe(false);
		})
	})
})

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