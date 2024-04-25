import type { SimpleBoard } from "./board/Board";
import type { LineType, PuzzleSymbol, PuzzleValue } from "./constants";

export type Brand<T, _Brand extends string> = T & { _brand: _Brand };
export type Flavor<T, _Flavor extends string> = T & { _flavor?: _Flavor };

export type Grid<T> = T[][];

export type PuzzleGrid = Grid<PuzzleValue>;
export type ROPuzzleGrid = ReadonlyArray<ReadonlyArray<PuzzleValue>>;

export type RowId = Flavor<string, 'RowId'>; // TODO: `${string}`?
export type ColumnId = Flavor<string, 'ColumnId'>; // TODO: `${number}`?
export type LineId = RowId | ColumnId;

export type IterableBoardLineString = {
	lineStr: string;
	lineType: LineType;
	lineId: LineId
};

export type Vec = { x: number, y: number };
export type VecValue = Vec & { value: PuzzleValue };
export type Target = Vec & { value: PuzzleSymbol };
export type VecValueChange = Vec & { value: PuzzleValue, prevValue: PuzzleValue };

export type XYKey = `${number},${number}`;

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

export type BoardExportString = Brand<string, "Board.export() => WxH;1.01100101...101">;
export type BoardString = Brand<string, "Board.toBoardString() => 1.01100101...101">;

export interface BoardShape {
	width: number,
	height: number
}
export interface BasicPuzzleConfig extends BoardShape {
	difficulty: DifficultyKey
}


/*
	--- BOARD COLLECTION TYPES ---
*/
type SimpleBoardToBoardString<T> = T extends SimpleBoard ? BoardString : never;
type SimpleBoardToBoardExportString<T> = T extends SimpleBoard ? BoardExportString : never;
type SimpleBoardToBoardOrExportString<T> = T extends SimpleBoard ? (BoardString | BoardExportString) : never;
type ToBoardStrings<T> = {
	[Property in keyof T]: SimpleBoardToBoardString<T[Property]>
}
type ToBoardExportStrings<T> = {
	[Property in keyof T]: SimpleBoardToBoardExportString<T[Property]>
}
type ToBoardOrExportStrings<T> = {
	[Property in keyof T]: SimpleBoardToBoardOrExportString<T[Property]>
}

export type AllPuzzleBoards = {
	board: SimpleBoard,
	solution: SimpleBoard,
	initialBoard: SimpleBoard
};
export type AllPuzzleBoardExportStrings = ToBoardExportStrings<AllPuzzleBoards>;
export type AllPuzzleBoardStrings = ToBoardStrings<AllPuzzleBoards>;
export type AllPuzzleBoardExportOrBoardStrings = ToBoardOrExportStrings<AllPuzzleBoards>;

export type BoardAndSolutionKeys = 'board' | 'solution';
export type BoardAndSolutionBoards = Pick<AllPuzzleBoards, BoardAndSolutionKeys>;
export type BoardAndSolutionBoardExports = Pick<AllPuzzleBoardExportStrings, BoardAndSolutionKeys>;
export type BoardAndSolutionBoardStrings = Pick<AllPuzzleBoardStrings, BoardAndSolutionKeys>;
export type BoardAndSolutionExportOrBoardStrings = Pick<AllPuzzleBoardExportOrBoardStrings, BoardAndSolutionKeys>;

export type InitialAndSolutionKeys = 'initialBoard' | 'solution';
export type InitialAndSolutionBoards = Pick<AllPuzzleBoards, InitialAndSolutionKeys>;
export type InitialAndSolutionBoardExports = Pick<AllPuzzleBoardExportStrings, InitialAndSolutionKeys>;
export type InitialAndSolutionBoardStrings = Pick<AllPuzzleBoardStrings, InitialAndSolutionKeys>;
export type InitialAndSolutionExportOrBoardStrings = Pick<AllPuzzleBoardExportOrBoardStrings, InitialAndSolutionKeys>;