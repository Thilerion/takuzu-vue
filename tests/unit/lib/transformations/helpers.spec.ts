import { SimpleBoard } from "@/lib/index.js";
import { createCombinedTransformationFn } from "@/lib/transformations/base-transformations.js";
import { applyTransformationConfig, getReverseTransformationConfig } from "@/lib/transformations/helpers.js";
import type { BaseTransformationConfig } from "@/lib/transformations/types.js";

describe('transformations helpers', () => {
	describe('getReverseTransformationConfig', () => {
		test('should return a transformation config that returns a grid to its original state, with rot180+flip', () => {
			const configA: BaseTransformationConfig = ['rot180', 'flip', 'invertSymbols'];
			const configReverse = getReverseTransformationConfig(configA);

			const gridA = SimpleBoard.fromArrayOfLines([
				'10.1',
				'..10',
				'.1..',
				'0..1'
			]).grid;
			const gridB = applyTransformationConfig(gridA, configA);
			const gridReverse = applyTransformationConfig(gridB, configReverse);

			expect(gridA).toEqual(gridReverse);
		})

		test('should return a transformation config that returns a grid to its original state, with rot90+flip', () => {
			const configA: BaseTransformationConfig = ['rot90', 'flip', 'invertSymbols'];
			const configReverse = getReverseTransformationConfig(configA);

			const gridA = SimpleBoard.fromArrayOfLines([
				'10.1',
				'..10',
				'.1..',
				'0..1'
			]).grid;
			const gridB = applyTransformationConfig(gridA, configA);
			const gridReverse = applyTransformationConfig(gridB, configReverse);

			expect(gridA).toEqual(gridReverse);
		})

		test('should return a transformation config that returns a grid to its original state, with rot270', () => {
			const configA: BaseTransformationConfig = ['rot270', 'noFlip', 'noInvert'];
			const configReverse = getReverseTransformationConfig(configA);

			const gridA = SimpleBoard.fromArrayOfLines([
				'10.1.',
				'..10.',
				'.1..1',
				'0..11',
				'1.1.1',
			]).grid;
			const gridB = applyTransformationConfig(gridA, configA);
			const gridReverse = applyTransformationConfig(gridB, configReverse);

			expect(gridA).toEqual(gridReverse);
		})
	})
})