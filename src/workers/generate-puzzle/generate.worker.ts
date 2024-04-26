import type { BasicPuzzleConfig, BoardExportString } from "@/lib/types.js";
import { setupWorker } from "../utils/workerSetup.js";
import { createPuzzle } from "@/lib/generation/puzzle.js";

const generateSinglePuzzle = (data: BasicPuzzleConfig): GeneratedPuzzleResult => {
	const { width, height, difficulty } = data;
	const result = createPuzzle({ width, height, difficulty });

	if (result != null && result.board != null) {
		const { solution, board } = result;
		return {
			solutionStr: solution.export(),
			boardStr: board.export()
		}
	} else if (!result) {
		throw new Error('Could not generate puzzle in time.');
	} else {
		throw new Error('Unexpected else statement reached in generatePuzzleWorker');
	}
}

const fns = {
	single: generateSinglePuzzle
} as const;

setupWorker(fns);

export type GenPuzzleWorkerFns = typeof fns;
export type GeneratedPuzzleResult = { solutionStr: BoardExportString, boardStr: BoardExportString };