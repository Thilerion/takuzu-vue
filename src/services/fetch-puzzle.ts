import type { AllPuzzleBoards, BasicPuzzleConfig, BoardAndSolutionBoardStrings, BoardString } from "@/lib/types";
import { generatePuzzle } from "@/workers/generate-puzzle/interface.js"; 
import type { GeneratedPuzzleResult } from "@/workers/generate-puzzle/generate.worker.js";
import { SimpleBoard } from "@/lib/board/Board.js";
import { initPregenPuzzles, retrievePregenPuzzleFromDb } from "@/workers/pregen-puzzles/interface.js";
import { puzzleHistoryTable } from "./db/stats-db/init.js";
import { pickRandom } from "@/utils/random.utils.js";

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

const FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 hours in ms
/**
 * Fetches a random replayable puzzle based on the provided configuration.
 * It will always return a puzzle that has been played before, but never in the last 4 hours (configurable).
 * 
 * @param config - The basic puzzle configuration: width, height, and difficulty
 * @param opts - Additional (optional) options for fetching the puzzle.
 * @param opts.minTimeMsSince - The minimum time in milliseconds since the last play (default: 4 hours).
 * @returns A promise that resolves to the board and solution board strings of the fetched puzzle, or null if no puzzle is found.
 */
export async function fetchRandomReplayablePuzzle(
	config: BasicPuzzleConfig,
	opts: { minTimeMsSince: number } = { minTimeMsSince: FOUR_HOURS }
): Promise<BoardAndSolutionBoardStrings | null> {
	const { width, height, difficulty } = config;
	const previousPlays = await puzzleHistoryTable
		.where('[width+height+difficulty]')
		.equals([width, height, difficulty])
		.toArray();
	
	if (!previousPlays.length) return null;

	const timestamp = Date.now();
	const { minTimeMsSince } = opts;

	// all previously played boards without duplicates
	const allUniquePlayedBoards = new Set<BoardString>(previousPlays.map(val => val.initialBoard));

	// remove all boards that were played in the last 4 hours
	for (const play of previousPlays) {
		const timeAgo = timestamp - play.timestamp;
		if (timeAgo < minTimeMsSince) {
			allUniquePlayedBoards.delete(play.initialBoard);
		}
	}

	if (!allUniquePlayedBoards.size) {
		console.log('Found boards, but none that were not recently played.');
		return null;
	}

	// pick a random board that was not played in the last 4 hours, but has been played before
	const randomBoard = pickRandom([...allUniquePlayedBoards]);
	// find the board in the previousPlays, to get the rest of the solution BoardString
	const randomPuzzle = previousPlays.find((val: { initialBoard: string }) => val.initialBoard === randomBoard)!;

	const boardStrings = {
		board: randomPuzzle.initialBoard,
		solution: randomPuzzle.solution
	}
	return boardStrings;
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

async function retrievePuzzleFromDatabase(puzzleConfig: BasicPuzzleConfig): Promise<PuzzleRequestResult<'error'>> {
	try {
		const result = await retrievePregenPuzzleFromDb(puzzleConfig);
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

async function generateNewPuzzle(puzzleConfig: BasicPuzzleConfig): Promise<PuzzleRequestResult<'error'>> {
	try {
		const result = await generatePuzzle(puzzleConfig);
		const { boardStr, solutionStr } = result;
		return { success: true, data: { boardStr, solutionStr } };
	} catch (e) {
		return { success: false, error: e };
	}
}