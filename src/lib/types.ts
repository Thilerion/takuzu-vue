import type { LineType, PuzzleSymbol, PuzzleValue } from "./constants";

export type Flavor<T, Flavor extends string> = T & { _flavor?: Flavor };

export type Grid<T> = T[][];

export type PuzzleGrid = Grid<PuzzleValue>;

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
export type LineSymbolCount = Record<PuzzleSymbol, number>;
export type LineValueCount = Record<PuzzleValue, number>;

export type ROPuzzleValueLine = Readonly<PuzzleValueLine>;
export type ROPuzzleSymbolLine = Readonly<PuzzleSymbolLine>;

export type PuzzleSymbolLineStr = Flavor<string, 'PuzzleSymbolLineStr'>;
export type PuzzleValueLineStr = Flavor<string, 'PuzzleValueLineStr'>;