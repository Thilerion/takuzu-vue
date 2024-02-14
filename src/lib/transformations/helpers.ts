import { type BaseTransformationConfig, type TransformationKey, type RotationTransform, type FlipTransform, type SymbolInversionTransform, flipValues, rotationValues, symbolInversionValues } from "./types.js";

export const getTransformationKey = ([rot, flip, invert]: BaseTransformationConfig) => {
	return `${rot}_${flip}_${invert}` as const satisfies TransformationKey;
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