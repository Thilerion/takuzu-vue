import type { BasicPuzzleConfig } from "@/lib/types";
import { generatePuzzle, type GeneratedPuzzleResult } from "@/workers/generate-puzzle-v2.js";
import { puzzleDb } from "./db/puzzles-db/init.js";

type RequestError<T> = T extends 'reason' ? { success: false, reason: unknown } : T extends 'error' ? { success: false, error: unknown } : never;
type PuzzleRequestResult<T> = RequestError<T> | { success: true, data: GeneratedPuzzleResult };

export async function requestPuzzle(puzzleConfig: BasicPuzzleConfig): Promise<PuzzleRequestResult<'reason'>> {
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
		}

		console.warn({ databaseResultError: dbResult, generateResultError: genResult.error });
		return { success: false, reason: 'Could not retrieve correct puzzle from database, and could not generate new puzzle.' };

	} catch (e) {
		console.warn('Unexpected error in requestPuzzle.');
		console.error(e);
		return { success: false, reason: e };
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