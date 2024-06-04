import type { Vec, XYKey } from "@/lib/types.js"

type ErrorMarkBase = {
	cell: Vec,
	id: XYKey,
	type: 'error'
}
export type IncorrectValueErrorMark = ErrorMarkBase & {
	errorType: 'incorrectValue', // only incorrect values for now
}
export type ErrorMark = IncorrectValueErrorMark; // for now, incorrectValue is the only marked error
export type ErrorMarkErrorType = ErrorMark['errorType'];
export type PuzzleBoardCellMark = ErrorMark; // for now, only type of mark is the error mark