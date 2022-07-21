import type { PuzzleValue } from "@/lib/constants";

export type ROArr<T> = ReadonlyArray<T>;
export type Grid<T> = T[][];
export type ROGrid<T> = ReadonlyArray<ReadonlyArray<T>>;
export type ROPuzzleGrid = ROGrid<PuzzleValue>;

export type GenericTransformFn = <T>(grid: ROGrid<T>) => Grid<T>;
export type GenericTransformFnWithType<T> = (grid: ROGrid<T>) => Grid<T>;
export type PuzzleTransformFn = GenericTransformFnWithType<PuzzleValue>;

export const gridRotations = [0, 90, 180, 270] as const;
export type GridRotation = typeof gridRotations[number]
export const isGridRotation = (value: number | string): value is GridRotation => {
	return (gridRotations as unknown as number[]).includes(+value);
}

type RotateTransformation = `rotate${GridRotation}`;
type RotateReflectTransformation = `${RotateTransformation}_reflect`;

export type GridTransformationFnName = RotateTransformation | RotateReflectTransformation;

type GridTransformationFnNameWithInvert = `${GridTransformationFnName}_invertSymbols`;

export type GridTransformationId = GridTransformationFnName | GridTransformationFnNameWithInvert; // 16 possible transformations
export type GridTransformationIdWithInvert = GridTransformationFnNameWithInvert;