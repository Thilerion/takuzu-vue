import type { BasicPuzzleConfig, BoardShape, DifficultyKey } from "@/lib/types.js";
import type { StatsDbHistoryEntry, StatsDbHistoryEntryWithId } from "../db/stats-db/models.js";
import { getPreviousItemsWithPuzzleConfig, getPuzzleCurrentCounts, getHistoryTotals, getUniquePlayedPuzzleConfigs, getPuzzleReplayStats } from "./stats-helpers.js";
import { getPercentageFaster, getPercentageSlower } from "./helpers.js";
import type { PickRequired } from "@/types.js";

/** Count/previousCount and count today for how many puzzles played with this specific puzzle config */
export interface IPuzzleConfigCounts {
	count: number,
	previous: number,
	today: number,

	/** total played with this size/dimensions only */
	withSize: number;
	/** Total played with this difficulty only */
	withDifficulty: number;
}

export interface IHistoryTotals {
	/** The amount of puzzles played in total */
	amount: number;
	/** The amount of puzzles of any config played today */
	today: number;
}
type WithCells<T> = T & { cells: number };
/** The unique dimensions/difficulties/puzzleConfigs played */
export interface IUniquePuzzleConfigurationPlayed {
	sizes: WithCells<BoardShape>[],
	difficulties: DifficultyKey[],
	configs: WithCells<BasicPuzzleConfig>[],
}
export interface IPuzzleReplayStatistics {
	// TODO: take into account transformations of same puzzle
	isReplay: boolean;
	previousPlays: StatsDbHistoryEntryWithId[]
}

export class GameEndStats {
	// related to current puzzle history entry/current puzzle config
	personalBest: PersonalBestGameEndStats;
	averageTimes: AverageTimeGameEndStats;
	currentCounts: IPuzzleConfigCounts;
	historyEntry: StatsDbHistoryEntry | StatsDbHistoryEntryWithId; // with id only if saved to database

	// related to all history entries
	totals: IHistoryTotals;
	uniqueConfigs: IUniquePuzzleConfigurationPlayed;
	// related to replaying the same puzzle
	replayStats: IPuzzleReplayStatistics;

	private constructor(
		historyEntry: StatsDbHistoryEntry | StatsDbHistoryEntryWithId,
		personalBest: PersonalBestGameEndStats,
		averageTimes: AverageTimeGameEndStats,
		currentCounts: IPuzzleConfigCounts,
		totals: IHistoryTotals,
		uniqueConfigs: IUniquePuzzleConfigurationPlayed,
		replayStats: IPuzzleReplayStatistics
	) {
		this.historyEntry = historyEntry;
		this.personalBest = personalBest;
		this.averageTimes = averageTimes;
		this.currentCounts = currentCounts;
		this.totals = totals;
		this.uniqueConfigs = uniqueConfigs;
		this.replayStats = replayStats;
		console.log(this);
	}
	
	static async init(entry: StatsDbHistoryEntry | StatsDbHistoryEntryWithId) {
		// entries are sorted by timeElapsed, with fastest items first
		// TODO: add test to ensure that the items are sorted by timeElapsed
		const { items, previousItems } = await getPreviousItemsWithPuzzleConfig(entry, entry.id ?? null);

		const personalBestStats = PersonalBestGameEndStats.fromItems(entry, items, previousItems);
		const averageTimes = AverageTimeGameEndStats.fromItems(items, previousItems);
		const currentCounts = await getPuzzleCurrentCounts(entry, items, previousItems);
		const historyTotals = await getHistoryTotals();
		const uniqueConfigs = await getUniquePlayedPuzzleConfigs();
		const replayStats = await getPuzzleReplayStats(entry);

		return new GameEndStats(
			entry,
			personalBestStats,
			averageTimes,
			currentCounts,
			historyTotals,
			uniqueConfigs,
			replayStats
		);
	}

	get isSavedToDb(): boolean {
		return this.historyEntry.id !== undefined;
	}
	get isFavorite(): boolean {
		const flag = this.historyEntry.flags?.favorite;
		return !!flag;
	}
	get hasCheatsUsed(): boolean {
		return !!(this.historyEntry.flags?.cheatsUsed);
	}

	/** Checks whether the historyEntry is the first puzzle played with that specific puzzle config */
	isFirstSolvedWithPuzzleConfig() {
		return this.currentCounts.previous === 0 && this.currentCounts.count === 1;
	}
	/** Checks whether the historyEntry is the first puzzle played with that specific difficulty */
	isFirstSolvedWithDifficulty() {
		return this.currentCounts.withDifficulty === 1;
	}
	/** Checks whether the historyEntry is the first puzzle played with that specific size/dimensions */
	isFirstSolvedWithSize() {
		return this.currentCounts.withSize === 1;
	}

	getHardestPuzzleConfigPlayed(): WithCells<BasicPuzzleConfig> | null {
		const configs = this.uniqueConfigs.configs;
		if (configs.length === 0) return null;
		else if (configs.length === 1) return configs[0];

		let current = configs[0];

		for (let i = 1; i < configs.length; i++) {
			if (comparePuzzleConfigDifficulty(configs[i], current)) {
				current = configs[i];
			}
		}
		return current;
	}
	/**
	 * Determine whether the puzzleConfig of the current entry is the same as the hardest puzzleConfig ever played.
	 * 
	 * Note: does not check if this is the first time this puzzle config has been played.
	 */
	isCurrentPuzzleHardestEverPlayed(): boolean {
		const hardest = this.getHardestPuzzleConfigPlayed();
		if (hardest == null) return false;

		const { width, height, difficulty } = this.historyEntry;
		return width === hardest.width && height === hardest.height && difficulty === hardest.difficulty;
	}

	getPuzzleConfig(): BasicPuzzleConfig {
		const { width, height, difficulty } = this.historyEntry;
		return { width, height, difficulty };
	}
	getTimeElapsed(): number {
		return this.historyEntry.timeElapsed;
	}
}

/** 
 * Returns true if config "a" is harder than config "b".
 * This is determined first by the difficulty, then by the amount of cells.
 */
function comparePuzzleConfigDifficulty(
	a: WithCells<BasicPuzzleConfig>,
	b: WithCells<BasicPuzzleConfig>
): boolean {
	if (a.difficulty > b.difficulty) return true;
	else if (a.difficulty < b.difficulty) return false;

	return a.cells > b.cells;
}

export class AverageTimeGameEndStats {
	average: number;
	previousAverage: number | null;

	constructor(
		data: {
			average: number,
			previousAverage: number | null
		}
	) {
		this.average = data.average;
		this.previousAverage = data.previousAverage;
	}

	static fromItems(
		items: StatsDbHistoryEntryWithId[],
		previousItems: StatsDbHistoryEntryWithId[]
	) {
		const timeSum = items.reduce((acc, val) => acc + val.timeElapsed, 0);
		const previousTimeSum = previousItems.reduce((acc, val) => acc + val.timeElapsed, 0);

		const average = timeSum / items.length;
		const previousAverage = previousItems.length > 0 ? previousTimeSum / previousItems.length : null;

		return new AverageTimeGameEndStats({
			average,
			previousAverage
		});
	}
}

export class PersonalBestGameEndStats {
	current: PickRequired<Partial<StatsDbHistoryEntryWithId>, 'timeElapsed'>;
	best: Pick<StatsDbHistoryEntryWithId, 'id' | 'timeElapsed'>;
	previousBest: Pick<StatsDbHistoryEntryWithId, 'id' | 'timeElapsed'> | null;

	constructor(
		data: {
			current: StatsDbHistoryEntry | StatsDbHistoryEntryWithId | PickRequired<Partial<StatsDbHistoryEntryWithId>, 'timeElapsed'>,
			best: Pick<StatsDbHistoryEntryWithId, 'id' | 'timeElapsed'>,
			previousBest: Pick<StatsDbHistoryEntryWithId, 'id' | 'timeElapsed'> | null
		}
	) {
		this.current = data.current;
		this.best = data.best;
		this.previousBest = data.previousBest;
	}

	static fromItems(
		current: StatsDbHistoryEntry | StatsDbHistoryEntryWithId,
		all: StatsDbHistoryEntryWithId[],
		previousAll: StatsDbHistoryEntryWithId[]
	) {
		const best = all[0];
		const previousBest = previousAll.length > 0 ? previousAll[0] : null;
		return new PersonalBestGameEndStats({
			current,
			best,
			previousBest
		})
	}

	isTimeRecord(): boolean {
		if (this.best.id !== this.current.id) return false;
		// the best is the same as the current entry, but might be due to having the exact same time
		if (this.previousBest == null) return true;
		// check if current time is faster than previous best. Should not ever actually be slower, but might be equal.
		return this.current.timeElapsed < this.previousBest.timeElapsed;
	}

	/**
	 * Returns the time improvement in milliseconds; positive if current is faster than previous fastest time; negative if slower.
	 * If there is no "previousBest" returns null.
	 */
	getTimeImprovement(): null | number {
		if (this.previousBest == null) return null;
		return this.previousBest.timeElapsed - this.current.timeElapsed;
	}

	/**
	 * Returns how much faster the current (best) time is compared to the previous best.
	 * Only applies if the current time is the best time, and there is a previous best time.
	 */
	getPercentageFasterThanPreviousBest(): number | null {
		if (this.previousBest == null) return null;
		const bestTime = this.best.timeElapsed;
		const previousBestTime = this.previousBest.timeElapsed;
		const currentTime = this.current.timeElapsed;
		// only applies if current time is the best time OR equals the best time
		if (currentTime > bestTime) return null;
		return getPercentageFaster(previousBestTime, currentTime);
	}

	getPercentageOffFromBest(): number | null {
		// when presenting as "you were only X% off from your best time"
		const best = this.best.timeElapsed;
		const current = this.current.timeElapsed;
		const p = ((best - current) / current);
		return p * -1; // assuming p was negative, because current took longer than best
	}

	getPercentageSlowerThanBest(): number | null {
		// when presenting as "you were X% slower than your best time"
		if (this.previousBest == null) return null;
		if (this.current.id != null && this.current.id === this.best.id) return 0;
		const bestTime = this.best.timeElapsed;
		const currentTime = this.current.timeElapsed;
		// if current time is faster than best, percentage slower is not relevant
		if (currentTime < bestTime) return null;
		return getPercentageSlower(bestTime, currentTime);
	}
}