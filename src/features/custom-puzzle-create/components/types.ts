import type { PuzzleSymbol } from "@/lib/constants.js";

export type CustomPuzzleInputValue = PuzzleSymbol | ' ' | '' | undefined | null;
export type CustomPuzzleInputGrid = CustomPuzzleInputValue[][];