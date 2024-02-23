import type { BoardShapeType } from "../helpers/board-type.js";
import type { PuzzleGrid } from "../types.js";
import { createCombinedTransformationFn } from "./base-transformations.js";
import { type BaseTransformationConfig, type TransformationKey, type RotationTransform, type FlipTransform, type SymbolInversionTransform, flipValues, rotationValues, symbolInversionValues } from "./types.js";

export const getTransformationKey = ([rot, flip, invert]: BaseTransformationConfig) => {
	return `${rot}_${flip}_${invert}` as const satisfies TransformationKey;
}

export function getTransformationConfigFromKey<K extends TransformationKey>(key: K): K extends `${infer R}_${infer F}_${infer I}` ? [R, F, I] : BaseTransformationConfig {
	return key.split('_') as any;
}

const createTransformationConfigs = (
	r: readonly RotationTransform[],
	f: readonly FlipTransform[],
	i: readonly SymbolInversionTransform[]
): readonly BaseTransformationConfig[] => {
	const result: BaseTransformationConfig[] = [];
	for (const rot of r) {
		for (const flip of f) {
			for (const invert of i) {
				result.push([rot, flip, invert]);
			}
		}
	}
	return result;
}

export const squareBoardTransformationConfigs = createTransformationConfigs(
	rotationValues,
	flipValues,
	symbolInversionValues
);
export const rectBoardTransformationConfigs = createTransformationConfigs(
	rotationValues.filter(r => ['rot0', 'rot180'].includes(r)),
	flipValues,
	symbolInversionValues
);
export const oddBoardTransformationConfigs = createTransformationConfigs(
	rotationValues,
	flipValues,
	['noInvert']
);

export const boardShapeTypeValidTransformationConfigs = (
	shapeType: BoardShapeType
): readonly BaseTransformationConfig[] => {
	switch (shapeType) {
		case 'square':
			return squareBoardTransformationConfigs;
		case 'rect':
			return rectBoardTransformationConfigs;
		case 'odd':
			return oddBoardTransformationConfigs;
		default: {
			const x: never = shapeType;
			throw new Error(`Invalid boardShapeType: ${x}`);
		}
	}
}

export function generateAllValidTransformations(
	grid: PuzzleGrid,
	shapeType: BoardShapeType
): Partial<Record<TransformationKey, PuzzleGrid>> {
	const configs = boardShapeTypeValidTransformationConfigs(shapeType);
		const result: Partial<Record<TransformationKey, PuzzleGrid>> = {};
        configs.forEach(config => {
            const key = getTransformationKey(config);
			const fn = createCombinedTransformationFn(config);
			result[key] = fn(grid);
        });
		return result;
}

export function rotationTransformToDegrees(rot: RotationTransform): number {
	switch (rot) {
		case 'rot0': return 0;
		case 'rot90': return 90;
		case 'rot180': return 180;
		case 'rot270': return 270;
		default: {
			const _exhaustiveCheck: never = rot;
			throw new Error(`Unexpected rotationTransformKey: ${_exhaustiveCheck}`);
		}
	}
}
export function degreesToRotationTransform(degrees: number): RotationTransform {
	const degreesMod = ((degrees % 360) + 360) % 360;
	switch (degreesMod) {
		case 0: return 'rot0';
		case 90: return 'rot90';
		case 180: return 'rot180';
		case 270: return 'rot270';
		default: throw new Error(`Unexpected degrees: ${degrees}`);
	}
}

export function getReverseTransformationConfig(config: BaseTransformationConfig): BaseTransformationConfig {
	const [rotA, flipA, invertA] = config;
	
	let rotB: RotationTransform;
	if (flipA === 'flip') {
		// due to order of operations (rotate then flip, if flip is present, rotation stays the same in reverse)
		rotB = rotA;
	} else {
		const rotIntA = rotationTransformToDegrees(rotA);
		const rotIntB = rotIntA * -1;
		rotB = degreesToRotationTransform(rotIntB);
	}
	

	const flipB = flipA;
	const invertB = invertA;

	return [rotB, flipB, invertB];
}

export function applyTransformationConfig(grid: PuzzleGrid, config: BaseTransformationConfig): PuzzleGrid {
	return createCombinedTransformationFn(config)(grid);
}