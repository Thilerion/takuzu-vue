import type { PuzzleValue } from "@/lib/constants";

export type ROArr<T> = ReadonlyArray<T>;
export type Grid<T> = T[][];
export type ROGrid<T> = ReadonlyArray<ReadonlyArray<T>>;

export type GenericTransformFn = <T>(grid: ROGrid<T>) => Grid<T>;
export type GenericTransformFnWithType<T> = (grid: ROGrid<T>) => Grid<T>;
export type PuzzleTransformFn = GenericTransformFnWithType<PuzzleValue>;

export type GridRotations = 0 | 90 | 180 | 270;