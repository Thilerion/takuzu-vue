import { type FinishedPuzzleState, StatsDbHistoryEntry, type StatsDbHistoryEntryWithId } from "@/services/db/stats-db/models.js";
import { defineStore } from "pinia";
import { startOfDay } from "date-fns";
import { useMainStore } from "./main";
import type { BasicPuzzleConfig, DifficultyKey } from "@/lib/types.js";
import { statsDb } from "@/services/db/stats-db/init.js";

type PuzzleStatisticsBestAverages = {
	best: number;
	previousBest: number | null;
	average: number;
	previousAverage: number | null;
}
type PuzzleStatisticsCounts = {
	count: number;
	previousCount: number;
	countToday: number;
}
type PuzzleStatistics = PuzzleStatisticsBestAverages & PuzzleStatisticsCounts & {
	isTimeRecord: boolean;
}
type ReplayStatistics = {
	isReplay: boolean | null;
	previousPlays: StatsDbHistoryEntry[];
}
type PlayedPuzzleData = {
	lastPuzzleEntry: StatsDbHistoryEntry | null;
	currentTimeElapsed: number | null;
}
type PuzzleConfigurationHistory = {
	sizesPlayed: { width: number, height: number, cells: number }[];
	difficultiesPlayed: DifficultyKey[];
	puzzleConfigsPlayed: { width: number, height: number, difficulty: DifficultyKey, cells: number }[];
}
type HistoryTotals = {
	totalSolved: number;
	totalSolvedToday: number;
}
type PuzzleConfigurationStatistics = {
	itemsPlayedWithSize: number;
	itemsPlayedWithDifficulty: number;
}
type UIState = {
	modalShown: boolean;
	initialized: boolean;
}
export type RecapStatsStoreState = PuzzleStatistics & PlayedPuzzleData & ReplayStatistics & PuzzleConfigurationHistory & HistoryTotals & PuzzleConfigurationStatistics & UIState;
export const useRecapStatsStore = defineStore('recapStats', {

	state: (): RecapStatsStoreState => ({
		modalShown: false,

		lastPuzzleEntry: null,

		currentTimeElapsed: null,

		best: 0,
		previousBest: 0,
		average: 0,
		previousAverage: 0,
		count: 0,
		previousCount: 0,
		countToday: 0,
		isTimeRecord: false,

		itemsPlayedWithSize: 0,
		itemsPlayedWithDifficulty: 0,

		totalSolved: 0,
		totalSolvedToday: 0,
		sizesPlayed: [],
		difficultiesPlayed: [],
		puzzleConfigsPlayed: [],

		isReplay: null,
		previousPlays: [],

		initialized: false,
	}),

	getters: {
		modalHidden: (state): boolean => !state.modalShown,
		hasPuzzleData: (state): boolean => state.lastPuzzleEntry?.width != null,
		isSavedToDb: (state): boolean => state.lastPuzzleEntry?.id != null,
		isFavorite: (state): boolean => !!state.lastPuzzleEntry?.flags?.favorite,

		differencePreviousAverage(): number | null {
			if (!this.initialized) return null;
			else if (this.isFirstSolvedWithPuzzleConfig) return this.currentTimeElapsed;
			else if (this.currentTimeElapsed == null || this.previousAverage == null) return null;
			return this.currentTimeElapsed - this.previousAverage;
		},
		isFirstSolvedWithPuzzleConfig: (state): boolean => state.initialized && state.previousCount === 0 && state.count === 1,
		isFirstSolvedWithDifficulty: (state): boolean => state.initialized && state.itemsPlayedWithDifficulty === 1,
		isFirstSolvedWithSize: (state): boolean => state.initialized && state.itemsPlayedWithSize === 1,
	},

	actions: {
		reset() {
			this.$reset();
		},
		showModal() {
			this.modalShown = true;
		},
		hideModal() {
			this.modalShown = false;
		},
		toggleModal(val: boolean) {
			if (val == null) {
				this.modalShown = !this.modalShown;
			} else {
				this.modalShown = val;
			}
		},

		setPuzzleEntry({historyEntry}: { historyEntry: StatsDbHistoryEntry }) {
			this.lastPuzzleEntry = historyEntry;
		},

		async initializeGameEndStats() {
			const historyEntry = this.lastPuzzleEntry;
			if (historyEntry == null || historyEntry.timestamp == null || historyEntry.difficulty == null) {
				throw new Error('Cannot initialize game end stats because puzzle entry is not initialized.');
			}
			const { timeElapsed } = historyEntry;
			
			const gameEndStatsBase = await createGameEndStats(historyEntry);
			
			this.$patch({
				modalShown: true, initialized: true,
				currentTimeElapsed: timeElapsed,
				...gameEndStatsBase
			})
		},

		async addFinishedPuzzleToHistory(puzzleState: FinishedPuzzleState) {
			const historyEntry = StatsDbHistoryEntry.fromPuzzleState(puzzleState);

			if (puzzleState.assistance.cheatsUsed) {
				const savePuzzleToHistoryIfCheatedFlag = useMainStore().featureToggles.addPuzzleToHistoryWithCheats.isEnabled;
				if (!savePuzzleToHistoryIfCheatedFlag) {
					console.warn('Cheats used; will not save entry to history!');
					this.setPuzzleEntry({ historyEntry/* , puzzleState */ });
					this.initializeGameEndStats(/* historyEntry */);
					return historyEntry;
				}
				// cheats were used, but will save to history anyway
			}
			const historyEntryUpdated = await this.addFinishedPuzzleToDb(historyEntry);
			this.setPuzzleEntry({ historyEntry: historyEntryUpdated });
			this.initializeGameEndStats();
			console.log('Puzzle saved to history.');
			return historyEntryUpdated;
		},
		async addFinishedPuzzleToDb(historyEntry: StatsDbHistoryEntry): Promise<StatsDbHistoryEntryWithId | StatsDbHistoryEntry> {
			try {
				const id = await statsDb.addEntry(historyEntry, true);
				if (id == null || typeof id !== 'number') {
					console.error('Did not receive a correct id after saving history entry.');
					console.warn({ id });
					return historyEntry as StatsDbHistoryEntry; // TODO: should I return it here?
				}
				return historyEntry as StatsDbHistoryEntryWithId;
			} catch (e) {
				console.error(e);
				console.warn('Could not save history entry!');
				return historyEntry as StatsDbHistoryEntry;
			}
		},

		async toggleFavorite() {
			return this.markFavorite(!this.isFavorite);
		},
		async saveNote(note: string | null | undefined = null) {
			if (this.lastPuzzleEntry == null || this.lastPuzzleEntry.id == null) {
				console.warn('Cannot save note because puzzle is not saved to database.');
				return false;
			}
			const { id } = this.lastPuzzleEntry;
			try {
				const success = await statsDb.updateItem(id, {
					note: note ?? undefined
				});
				if (success) {
					console.log('Succesfully saved note.');
					this.lastPuzzleEntry.note = note ?? undefined;
				} else {
					console.error('Could not save note.');
				}
				return success;
			} catch (e) {
				console.warn('Error in saving note.');
				console.error(e);
				return false;
			}
		},

		async markFavorite(value = true) {
			if (!this.isSavedToDb || this.lastPuzzleEntry == null || this.lastPuzzleEntry.id == null) {
				console.warn('Cannot mark as favorite because puzzle is not saved to database.');
				return;
			}
			const { id, flags: currentFlags } = this.lastPuzzleEntry;
			const newFlags = { ...currentFlags, favorite: (value ? 1 : 0 as 1 | 0) };
			try {
				const success = await statsDb.updateItem(id, {
					flags: { ...newFlags }
				});
				if (success) {
					this.lastPuzzleEntry.flags = { ...newFlags };
				} else {
					console.warn(`Could not set puzzle as "favorite = ${value}"`);
				}
				return success;
			} catch (e) {
				console.warn(`Could not set puzzle as "favorite = ${value}"`);
				console.error(e);
				return false;
			}
		}
	}

});

async function createGameEndStats({ width, height, difficulty, timeElapsed, id, initialBoard }: StatsDbHistoryEntry) {

	const [
		puzzleConfigResult,
		sizeDifficultyResult,
		totalsResult,
		itemsWithSameInitialBoardResult
	] = await Promise.all([
		getPuzzlesPlayedWithPuzzleConfig({
			width, height, difficulty, id
		}),
		getPuzzleCountWithSizeOrDifficulty({
			width, height, difficulty
		}),
		getTotalSolved(),
		getItemsWithSameInitialBoard({initialBoard, id})
	])


	const { items, previousItems } = puzzleConfigResult;
	const { itemsPlayedWithDifficulty, itemsPlayedWithSize } = sizeDifficultyResult;
	const { totalSolved, totalSolvedToday, sizesPlayed, difficultiesPlayed, puzzleConfigsPlayed } = totalsResult;

	const startOfToday = startOfDay(Date.now());
	const startOfTodayTimestamp = startOfToday.getTime();
	const countToday = items.filter(item => {
		return item.timestamp >= startOfTodayTimestamp;
	}).length;

	const count = items.length;
	const previousCount = previousItems.length;

	const bestAverageTimes = getBestAndAverageTimes({
		items, previousItems
	});

	const isTimeRecord = checkIsTimeRecord(bestAverageTimes, timeElapsed);

	const { isReplay, previousPlays } = itemsWithSameInitialBoardResult;

	const result: PuzzleStatistics & HistoryTotals & PuzzleConfigurationHistory & ReplayStatistics & PuzzleConfigurationStatistics = {
		...bestAverageTimes,
		count, previousCount, countToday,
		isTimeRecord,

		itemsPlayedWithDifficulty,
		itemsPlayedWithSize,
		
		totalSolved,
		totalSolvedToday,
		sizesPlayed,
		difficultiesPlayed,
		puzzleConfigsPlayed,

		isReplay,
		previousPlays
	}

	return result;
}

async function getItemsWithSameInitialBoard({initialBoard, id}: { initialBoard: string, id?: number }) {
	const previousPlays = await statsDb.puzzleHistory.where({
		initialBoard
	}).filter(item => id == null || item.id !== id).toArray();

	const isReplay = previousPlays.length > 0;
	return { isReplay, previousPlays };
}

async function getTotalSolved(): Promise<HistoryTotals & PuzzleConfigurationHistory> {
	try {
		const startOfToday = startOfDay(Date.now());
		const startOfTodayTimestamp = startOfToday.getTime();

		const results = await Promise.all([
			statsDb.getTotalSolved(),
			statsDb.getUniquePlayedSizes(),
			statsDb.getUniquePlayedDifficulties(),
			statsDb.getUniquePlayedPuzzleConfigs(),
			statsDb.getTotalSolvedAfterDate(startOfTodayTimestamp)
		])

		const [totalSolved, sizes, difficulties, sizeAndDifficulties, totalSolvedToday] = results;
		console.log(results);

		const sizesPlayed = sizes.map((shape) => ({
			width: shape.width,
			height: shape.height,
			cells: shape.width * shape.height
		})).sort((a, b) => {
			return a.cells - b.cells;
		});
		const difficultiesPlayed = [...difficulties].sort((a, b) => {
			return a - b;
		})
		const puzzleConfigsPlayed = sizeAndDifficulties.map((conf) => {
			const cells = conf.width * conf.height;
			return { ...conf, cells };
		}).sort((a, b) => {
			const byDiff = a.difficulty - b.difficulty;
			if (byDiff !== 0) return byDiff;
			return a.cells - b.cells;
		})
		
		return {
			totalSolved,
			totalSolvedToday,
			sizesPlayed,
			difficultiesPlayed,
			puzzleConfigsPlayed
		}
	} catch (e) {
		console.error(e);
		return {
			totalSolved: 0,
			totalSolvedToday: 0,
			sizesPlayed: [],
			difficultiesPlayed: [],
			puzzleConfigsPlayed: []
		}
	}
}

async function getPuzzlesPlayedWithPuzzleConfig({ width, height, difficulty, id }: BasicPuzzleConfig & { id?: number}) {
	try {
		const items = await statsDb.puzzleHistory
			.where('[width+height+difficulty]')
			.equals([width, height, difficulty])
			.sortBy('timeElapsed');
		const previousItems = items.filter(val => val.id !== id);
		return { items, previousItems };
	} catch (e) {
		console.error(e);
		return {
			previousItems: [],
			items: []
		}
	}
}

async function getPuzzleCountWithSizeOrDifficulty({ width, height, difficulty }: BasicPuzzleConfig): Promise<PuzzleConfigurationStatistics> {
	try {
		const sizeCount = statsDb.puzzleHistory.where('[width+height]').equals([width, height]).count();
		const difficultyCount = statsDb.puzzleHistory.where('difficulty').equals(difficulty).count();
		
		return {
			itemsPlayedWithSize: await sizeCount,
			itemsPlayedWithDifficulty: await difficultyCount
		}
	} catch (e) {
		console.error(e);
		return { itemsPlayedWithSize: 0, itemsPlayedWithDifficulty: 0 };
	}
}

function getBestAndAverageTimes({ items, previousItems }: { items: StatsDbHistoryEntry[], previousItems: StatsDbHistoryEntry[] }): PuzzleStatisticsBestAverages {
	if (!items.length) {
		return {
			best: 0,
			previousBest: null,
			average: 0,
			previousAverage: null
		}
	}
	const bestTimeItem = items[0];
	const previousBestTimeItem = previousItems?.[0] ?? null;

	const sum = items.reduce((acc, val) => acc + val.timeElapsed, 0);
	const previousSum = previousItems.reduce((acc, val) => acc + val.timeElapsed, 0);

	return {
		average: sum == null ? 0 : sum / items.length,
		previousAverage: previousSum ? previousSum / previousItems.length : null,

		best: bestTimeItem.timeElapsed ?? 0,
		previousBest: previousBestTimeItem?.timeElapsed ?? null,
	}
}
function checkIsTimeRecord(times: PuzzleStatisticsBestAverages, timeElapsed: number): boolean {
	const { best, previousBest } = times;
	return previousBest == null || (best < previousBest && best === timeElapsed)
}