import { type PuzzleSymbol, ONE, ZERO, type PuzzleValue, PUZZLE_VALUES, EMPTY } from "../constants";

export const isPuzzleSymbol = (value: unknown): value is PuzzleSymbol => value === ONE || value === ZERO;
export const isPuzzleValue = (value: unknown): value is PuzzleValue => (PUZZLE_VALUES as ReadonlyArray<unknown>).includes(value);
export const getOppositeSymbol = (value: PuzzleSymbol) => value === ONE ? ZERO : ONE;