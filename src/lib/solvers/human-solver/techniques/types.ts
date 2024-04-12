import type { BoardLine } from "@/lib/board/BoardLine.js"

export type WithGetBoardLineIterableFn = {
	boardLines: () => Iterable<BoardLine>
}