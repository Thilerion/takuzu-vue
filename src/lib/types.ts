import type { LineType, PuzzleValue } from "./constants";

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