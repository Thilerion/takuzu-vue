import type { BasicPuzzleConfig, BoardShape, BoardString, DifficultyKey } from "@/lib/types";
import { startOfDay } from "date-fns";
import { db as StatsDB } from './db';
import type { DbHistoryEntry } from "./db/models";

export async function createRecapGameEndStats(entry: DbHistoryEntry) {
    const { width, height, difficulty, timeElapsed, id, initialBoard } = entry;
    
    const partialResults = await Promise.all([
        getPuzzlesPlayedWithPuzzleConfig(entry, id),
        getPuzzleCountWithSizeOrDifficulty(entry),
        getTotalSolved(),
        getItemsWithSameInitialBoard(entry),
        getPreviousConfigsPlayed()
    ])

    const { items, previousItems } = partialResults[0];
    const { sizeCount, difficultyCount } = partialResults[1];
    const totalsResults = partialResults[2];
    const { isReplay, previousPlays } = partialResults[3];
    const playedConfsResults = partialResults[4];
 
    const count = items.length;
	const previousCount = previousItems.length;
    const { best, average, previousAverage, previousBest } = getBestAndAverageTimes({ items, previousItems});

    const isTimeRecord = best === timeElapsed && previousBest != null && best < previousBest;


    // TODO: is countToday not the same as totalsSolved.totalSolvedToday?
    const startOfToday = startOfDay(Date.now());
	const startOfTodayTimestamp = startOfToday.getTime();
	const countToday = items.filter(item => {
		return item.timestamp >= startOfTodayTimestamp;
	}).length;

    return {
		best, previousBest,
		average, previousAverage,
		count, previousCount, countToday,
		isTimeRecord,

		sizeCount,
		difficultyCount,
		
        ...totalsResults,
        ...playedConfsResults,

		isReplay,
		previousPlays
	};
}

interface PuzzlesPlayedWithSameConfig {
    previousItems: DbHistoryEntry[],
    items: DbHistoryEntry[]
}
interface WithPreviousPlayed {
    isReplay: boolean,
    previousPlays: DbHistoryEntry[]
}
interface WithTotalSolved {
    totalSolved: number,
    totalSolvedToday: number
}
interface PreviousConfigsPlayed {
    sizesPlayed: (BoardShape & { cells: number })[],
    difficultiesPlayed: DifficultyKey[],
    puzzleConfigsPlayed: (BasicPuzzleConfig & { cells: number })[]
}
interface SizeDifficultyCounts {
    sizeCount: number,
    difficultyCount: number
}

type CurrentBestAndAverageProp = 'best' | 'average';
type PreviousBestAndAverageProp = 'previousBest' | 'previousAverage';
type BestAndAverageTimes = Record<CurrentBestAndAverageProp | PreviousBestAndAverageProp, null> | Record<CurrentBestAndAverageProp | PreviousBestAndAverageProp, number> | (Record<CurrentBestAndAverageProp, number> & Record<PreviousBestAndAverageProp, null>);

async function getPuzzlesPlayedWithPuzzleConfig(conf: BasicPuzzleConfig, id?: number): Promise<PuzzlesPlayedWithSameConfig> {
    const { width, height, difficulty } = conf;
    const items = await StatsDB.puzzleHistory
        .where('[width+height+difficulty]')
        .equals([width, height, difficulty])
        .sortBy('timeElapsed');
    const previousItems = items.filter(val => val.id !== id);
    return { items, previousItems };
}

async function getItemsWithSameInitialBoard(data: { initialBoard: BoardString, id?: number }): Promise<WithPreviousPlayed> {
    const previousPlaysQ = StatsDB.puzzleHistory.where({ initialBoard: data.initialBoard });
    const filtered = data.id == null ? previousPlaysQ : previousPlaysQ.filter(item => item.id !== data.id);
    const previousPlays = await filtered.toArray();
    return {
        isReplay: previousPlays.length > 0,
        previousPlays
    }
}

async function getTotalSolved(): Promise<WithTotalSolved> {
    const startOfToday = startOfDay(Date.now());
    const startOfTodayTimestamp = startOfToday.getTime();

    const [totalSolved, totalSolvedToday] = await Promise.all([
        StatsDB.getCount(),
        StatsDB.puzzleHistory.where('timestamp').above(startOfTodayTimestamp).count()
    ]);
    return { totalSolved, totalSolvedToday };
}

async function getPreviousConfigsPlayed(): Promise<PreviousConfigsPlayed> {
    const [
        sizes, difficulties, sizeAndDifficulties
    ] = await Promise.all([
        StatsDB.puzzleHistory.orderBy('[width+height]').uniqueKeys(),
        StatsDB.puzzleHistory.orderBy('difficulty').uniqueKeys(),
        StatsDB.puzzleHistory.orderBy('[width+height+difficulty]').uniqueKeys()
    ])

    const sizesPlayed = (sizes as unknown as number[][]).map(([width, height]) => {
        const cells = width * height;
        return { width, height, cells };
    }).sort(byCells);

    const difficultiesPlayed = ([...difficulties] as DifficultyKey[]).sort((a, b) => {
        return a - b;
    })

    const puzzleConfigsPlayed = (sizeAndDifficulties as unknown as [number, number, DifficultyKey][]).map(v => {
        const [width, height, difficulty] = v;
        return { width, height, difficulty, cells: width * height };
    }).sort(byCells);

    return { sizesPlayed, difficultiesPlayed, puzzleConfigsPlayed }
}

async function getPuzzleCountWithSizeOrDifficulty(conf: BasicPuzzleConfig): Promise<SizeDifficultyCounts> {
    const { width, height, difficulty } = conf;
    const [sizeCount, difficultyCount] = await Promise.all([
        StatsDB.puzzleHistory.where('[width+height]').equals([width, height]).count(),
        StatsDB.puzzleHistory.where('difficulty').equals(difficulty).count()
    ]);
	return { sizeCount, difficultyCount }
}

function getBestAndAverageTimes(data: { items: DbHistoryEntry[], previousItems: DbHistoryEntry[]}): BestAndAverageTimes {
    const { items } = data;
    if (!items.length) {
        return { best: null, previousBest: null, average: null, previousAverage: null };
    }
    
    const bestTimeItem = items[0];
	const sum = items.reduce((acc, val) => acc + val.timeElapsed, 0);
    const average = sum / items.length;
    const best = bestTimeItem.timeElapsed;

    const { previousItems } = data;
    if (!previousItems.length) {
        return { average, best, previousAverage: null, previousBest: null};
    }
    
	const previousBestTimeItem = previousItems[0];
	const previousSum = previousItems.reduce((acc, val) => acc + val.timeElapsed, 0);

	return {
		average,
		previousAverage: previousSum / previousItems.length,

		best,
		previousBest: previousBestTimeItem.timeElapsed,
	}
}

const byCells = (a: { cells: number }, b: { cells: number }) => a.cells - b.cells;