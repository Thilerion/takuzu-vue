import { generatePuzzle } from "@/workers/generate-puzzle.js";
import { puzzleDb } from "./puzzles-db/db";

export async function requestPuzzle(puzzleConfig) {
	console.log('PUZZLE REQUESTED');
	try {
		const dbResult = await retrievePuzzleFromDatabase(puzzleConfig);
		if (dbResult.success) {
			// type of data: { boardStr, solutionStr };
			return { success: true, data: dbResult.data };
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

export async function retrievePuzzleFromDatabase(puzzleConfig) {
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

export async function generateNewPuzzle(puzzleConfig) {
	try {
		const result = await generatePuzzle(puzzleConfig);
		if (result && result.success) {
			const { boardStr, solutionStr } = result.value;
			return { success: true, data: { boardStr, solutionStr } };
		} else {
			console.error({ result });
			throw new Error('Error in generateNewPuzzle; invalid result data.');
		}
	} catch (e) {
		return { success: false, error: e };
	}
}