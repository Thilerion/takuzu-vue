import type { PuzzleValue } from "../constants.js";
import type { BoardString, PuzzleGrid } from "../types.js";

export const rotationValues = ['rot0', 'rot90', 'rot180', 'rot270'] as const;
export const flipValues = ['noFlip', 'flip'] as const;
export const symbolInversionValues = ['noInvert', 'invertSymbols'] as const;

export type RotationTransform = 'rot0' | 'rot90' | 'rot180' | 'rot270';
export type FlipTransform = 'noFlip' | 'flip';
export type SymbolInversionTransform = 'noInvert' | 'invertSymbols';

export type BaseTransformationConfig = [
	RotationTransform,
	FlipTransform,
	SymbolInversionTransform,
];

// type ToValidRectBoardKey<K> = K extends `${'rot90' | 'rot270'}_${string}_${string}` ? never : K;
// type ToValidOddBoardKey<K> = K extends `${string}_${string}_invertSymbols` ? never : K;

export type TransformationKey = `${RotationTransform}_${FlipTransform}_${SymbolInversionTransform}`;

export type TransformationRecord<T> = Record<TransformationKey, T>;
export type TransformationMap<T> = Map<TransformationKey, T>;
export type TransformationBoardStringsMap = TransformationMap<BoardString>;

export type ReadonlyGrid = ReadonlyArray<ReadonlyArray<PuzzleValue>>;
export type TransformationFn = (grid: ReadonlyGrid) => PuzzleGrid;