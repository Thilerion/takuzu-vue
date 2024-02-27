import type { PuzzleSymbol } from "@/lib/constants.js";
import type { Grid } from "@/lib/types.js";

export type PuzzleInputValue = PuzzleSymbol | '';
export type PuzzleInputGrid = Grid<PuzzleInputValue>;