import type { SimpleBoard } from "./board/Board";
import type { LineType, PuzzleSymbol, PuzzleValue } from "./constants";

export type Brand<T, Brand extends string> = T & { _brand: Brand };
export type Flavor<T, Flavor extends string> = T & { _flavor?: Flavor };

export type Grid<T> = T[][];

export type PuzzleGrid = Grid<PuzzleValue>;
export type ROPuzzleGrid = ReadonlyArray<ReadonlyArray<PuzzleValue>>;

export type RowId = Flavor<string, 'RowId'>;
export type ColumnId = Flavor<string, 'ColumnId'>;
export type LineId = RowId | ColumnId;

export type IterableBoardLineString = {
	lineStr: string;
	lineType: LineType;
	lineId: LineId
};

export type Vec = { x: number, y: number };
export type Target = Vec & { value: PuzzleSymbol };

export type PuzzleValueLine = PuzzleValue[];
export type PuzzleSymbolLine = PuzzleSymbol[];
export type CountsOf<T extends (string | number)> = Record<T, number>;
export type PuzzleSymbolCount = CountsOf<PuzzleSymbol>;
export type PuzzleValueCount = CountsOf<PuzzleValue>;
export type NumSymbolRequired = Record<LineType, PuzzleSymbolCount>;
export type LineCounts = PuzzleValueCount[];
export type GridCounts = PuzzleValueCount;

export type ROPuzzleValueLine = Readonly<PuzzleValueLine>;
export type ROPuzzleSymbolLine = Readonly<PuzzleSymbolLine>;

export type PuzzleSymbolLineStr = Flavor<string, 'PuzzleSymbolLineStr'>;
export type PuzzleValueLineStr = Flavor<string, 'PuzzleValueLineStr'>;

export type DimensionStr = `${number}x${number}`;
export type DifficultyKey = 1 | 2 | 3 | 4 | 5;
export type PuzzleConfigKey = `${DimensionStr}-${DifficultyKey}`;

export type BoardExportString = Brand<string, "BoardExportString">;
export type BoardString = Flavor<string, "Board.toString()">;

export interface BoardShape {
	width: number,
	height: number
}
export interface BasicPuzzleConfig extends BoardShape {
	difficulty: DifficultyKey
}

export interface PuzzleBoards {
	board: SimpleBoard,
	solution: SimpleBoard
}