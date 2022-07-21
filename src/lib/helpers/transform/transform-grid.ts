import { SimpleBoard } from "@/lib";
import type { PuzzleBoards } from "@/lib/types";
import { invertPuzzle, transformationFnMap } from "./transformation-fns";
import type { GenericTransformFn, GridTransformationFnName, GridTransformationId, GridTransformationIdWithInvert, ROPuzzleGrid } from "./types";

function fnFromName(str: GridTransformationFnName): GenericTransformFn {
	return transformationFnMap[str];
}
function fnNameFromId(id: GridTransformationId): GridTransformationFnName {
	return id.replace('_invertSymbols', '') as GridTransformationFnName;
}
function fnFromId(id: GridTransformationId): GenericTransformFn {
	return fnFromName(fnNameFromId(id));
}
function isTransformationIdWithInvertedSymbols(id: GridTransformationId): id is GridTransformationIdWithInvert {
	return id.includes('_invertSymbols');
}

export function getTransformedGrid(grid: ROPuzzleGrid, transformId: GridTransformationId) {
	const fn = fnFromId(transformId);
	if (isTransformationIdWithInvertedSymbols(transformId)) {
		return invertPuzzle(fn(grid));
	} else return fn(grid);
}
export function getTransformedBoard(board: SimpleBoard, transformId: GridTransformationId) {
	const grid = getTransformedGrid(board.grid, transformId);
	return new SimpleBoard(grid);
}
export function getTransformedPuzzleBoards({
	board, solution
}: PuzzleBoards, transformId: GridTransformationId) {
	return {
		board: getTransformedBoard(board, transformId),
		solution: getTransformedBoard(solution, transformId)
	};
}