import type { BasicPuzzleConfig } from "@/lib/types";
import type { DbHistoryEntry } from "../stats/db/models";

export enum RecapMsgType {
	"NOT_ADDED_TO_DB_CHEATS" = "NOT_ADDED_TO_DB_CHEATS",
	
	"FIRST_TOTAL" = "FIRST_TOTAL",
	
    "HARDEST_EVER" = "HARDEST_EVER",
    "FIRST_OF_DIFFICULTY" = "FIRST_OF_DIFFICULTY",
    "FIRST_OF_SIZE" = "FIRST_OF_SIZE",
	"FIRST_OF_SIZE_DIFFICULTY" = "FIRST_OF_SIZE_DIFFICULTY",
	
    "TIME_RECORD_LARGE" = "TIME_RECORD_LARGE",
	"TIME_RECORD" = "TIME_RECORD",

	"REPLAY_TIME_RECORD" = "REPLAY_TIME_RECORD",
	
    "ALMOST_TIME_RECORD_ABSOLUTE" = "ALMOST_TIME_RECORD_ABSOLUTE",
	"ALMOST_TIME_RECORD_PERCENTAGE" = "ALMOST_TIME_RECORD_PERCENTAGE",
	
    "MUCH_BETTER_THAN_AVERAGE_ABSOLUTE" = "MUCH_BETTER_THAN_AVERAGE_ABSOLUTE",
    "MUCH_BETTER_THAN_AVERAGE_PERCENTAGE" = "MUCH_BETTER_THAN_AVERAGE_PERCENTAGE",
	"BETTER_THAN_AVERAGE" = "BETTER_THAN_AVERAGE",
	
    // "WORST_EVER" = "WORST_EVER", // TODO
	// "NEARLY_WORST_EVER" = "NEARLY_WORST_EVER", // TODO

	"REPLAY_PLAYS_TOTAL" = "REPLAY_PLAYS_TOTAL",
	
    "PLAYS_TOTAL" = "PLAYS_TOTAL",
    "PLAYS_TODAY" = "PLAYS_TODAY",
    "PLAYS_CONFIG_TOTAL" = "PLAYS_CONFIG_TOTAL",
	"PLAYS_CONFIG_TODAY" = "PLAYS_CONFIG_TODAY",
	
    "DEFAULT" = "DEFAULT"
}

export enum RecordType {
	FIRST_TOTAL = 'FIRST_TOTAL',
	TIME_RECORD = 'TIME_RECORD',
}

export interface AppliesRequiredData {
	lastPuzzleEntry: DbHistoryEntry,

	isSavedToDb: boolean,
	isReplay: boolean,

	totalSolved: number,
	totalSolvedToday: number,

	isFirstSolvedWithPuzzleConfig: boolean,

	itemsPlayedWithDifficulty: number,
	itemsPlayedWithSize: number,
	count: number,
	countToday: number,
	previousCount: number,
	currentTimeElapsed: number,
	best: number,
	previousBest: number,
	previousPlays: DbHistoryEntry[],
	average: number,
	previousAverage: number,

	puzzleConfigsPlayed: (BasicPuzzleConfig & { cells: number })[],
}