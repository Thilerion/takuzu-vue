import type { AllPuzzleBoards, BasicPuzzleConfig } from "@/lib/types";
import { generatePuzzle } from "@/workers/generate-puzzle/interface.js"; 
import type { GeneratedPuzzleResult } from "@/workers/generate-puzzle/worker.js";
import { puzzleDb } from "./db/puzzles-db/init.js";
import { SimpleBoard } from "@/lib/index.js";
import { initPregenPuzzles } from "@/workers/pregen-puzzles/interface.js";

type RequestError<T> = T extends 'reason' ? { success: false, reason: string } : T extends 'error' ? { success: false, error: unknown } : never;
type PuzzleRequestResult<T> = RequestError<T> | { success: true, data: GeneratedPuzzleResult };

export async function fetchAndPreparePuzzle(config: BasicPuzzleConfig): Promise<AllPuzzleBoards> {
	const res = await requestPuzzle(config);
	if (!res.success) throw new Error(res.reason);
	const { boardStr, solutionStr } = res.data;
	const board = SimpleBoard.import(boardStr);
	const solution = SimpleBoard.import(solutionStr);
	const initialBoard = board.copy();
	// generate new puzzles in worker, to keep enough puzzles stored in database for when a user requests a new puzzle
	window.setTimeout(() => {
		initPregenPuzzles();
	}, 2000);
	return {
		board,
		solution,
		initialBoard
	}
}
async function requestPuzzle(puzzleConfig: BasicPuzzleConfig): Promise<PuzzleRequestResult<'reason'>> {
	console.log('PUZZLE REQUESTED');
	try {
		const dbResult = await retrievePuzzleFromDatabase(puzzleConfig);
		if (dbResult.success) {
			// type of data: { boardStr, solutionStr };
			return { success: true as const, data: dbResult.data };
		}
		console.log('TRYING TO GENERATE');
		const genResult = await generateNewPuzzle(puzzleConfig);
		if (genResult.success) {
			return genResult;
		} else {
			console.warn({ databaseResultError: dbResult, generateResultError: (genResult as RequestError<'error'>).error });
			return { success: false, reason: 'Could not retrieve correct puzzle from database, and could not generate new puzzle.' };
		}


	} catch (e) {
		console.warn('Unexpected error in requestPuzzle.');
		console.error(e);
		if (typeof e === 'string') return { success: false, reason: e };
		else if (e instanceof Error) return { success: false, reason: e.message };
		throw e;
	}	
}

export async function retrievePuzzleFromDatabase(puzzleConfig: BasicPuzzleConfig): Promise<PuzzleRequestResult<'error'>> {
	try {
		const result = await puzzleDb.getPuzzle(puzzleConfig);
		if (result) {
			const { boardStr, solutionStr } = result;
			return { success: true, data: { boardStr, solutionStr } };
		} else {
			console.error({ result });
			throw new Error('No puzzle found in database for this puzzle config.');
		}
	} catch (e) {
		console.error(e);
		return { success: false, error: e };
	}
}

export async function generateNewPuzzle(puzzleConfig: BasicPuzzleConfig): Promise<PuzzleRequestResult<'error'>> {
	try {
		const result = await generatePuzzle(puzzleConfig);
		const { boardStr, solutionStr } = result;
		return { success: true, data: { boardStr, solutionStr } };
	} catch (e) {
		return { success: false, error: e };
	}
}