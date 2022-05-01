import { DbHistoryEntry as HistoryDbEntry } from "@/services/stats/db/models";
import { defineStore } from "pinia";
import * as StatsDB from "@/services/stats/db/index.js";
import { startOfDay } from "date-fns/esm";

const SHOULD_SAVE_PUZZLE_CHEATED = import.meta.env.DEV && false;

export const useRecapStatsStore = defineStore('recapStats', {

	state: () => ({
		modalShown: false,

		lastPuzzleEntry: {
			width: null,
			height: null,
			difficulty: null,
			id: null,
			timeElapsed: null,
			flags: {
				favorite: null,
				cheatsUsed: null
			}
		},

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
		modalHidden: state => !state.modalShown,
		hasPuzzleData: state => state.lastPuzzleEntry?.width != null,
		isSavedToDb: state => state.lastPuzzleEntry?.id != null,

		differencePreviousAverage() {
			if (!this.initialized) return null;
			else if (this.isFirstSolvedWithPuzzleConfig) return this.currentTimeElapsed;
			return this.currentTimeElapsed - this.previousAverage;
		},
		isFirstSolvedWithPuzzleConfig: state => state.initialized && state.previousCount === 0 && state.count === 1,
		isFirstSolvedWithDifficulty: state => state.initialized && state.itemsPlayedWithDifficulty === 1,
		isFirstSolvedWithSize: state => state.initialized && state.itemsPlayedWithSize === 1,
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
		toggleModal(val) {
			if (val == null) {
				this.modalShown = !this.modalShown;
			} else {
				this.modalShown = val;
			}
		},

		setPuzzleEntry({historyEntry}) {
			this.lastPuzzleEntry = historyEntry;
		},

		async initializeGameEndStats() {
			const historyEntry = this.lastPuzzleEntry;
			const { timeElapsed } = historyEntry;
			
			const {
				best, previousBest,
				average, previousAverage,
				count, previousCount, countToday,
				isTimeRecord,

				sizeCount,
				difficultyCount,

				totalSolved,
				totalSolvedToday,
				sizesPlayed,
				difficultiesPlayed,
				puzzleConfigsPlayed,

				isReplay,
				previousPlays
			} = await createGameEndStats(historyEntry);
			
			this.$patch({
				best, previousBest, average, previousAverage,
				count, previousCount, countToday,
				isTimeRecord,
				modalShown: true, initialized: true,
				currentTimeElapsed: timeElapsed,

				itemsPlayedWithDifficulty: difficultyCount,
				itemsPlayedWithSize: sizeCount,

				totalSolved,
				totalSolvedToday,
				sizesPlayed,
				difficultiesPlayed,
				puzzleConfigsPlayed,

				isReplay,
				previousPlays
			})
		},

		async addFinishedPuzzleToHistory(puzzleState) {
			const historyEntry = HistoryDbEntry.fromPuzzleState(puzzleState);

			if (puzzleState.assistance.cheatsUsed) {
				if (SHOULD_SAVE_PUZZLE_CHEATED) {
					console.log('Cheats used, but will save to history anyway.');
				} else {
					console.warn('Cheats used; will not save entry to history!');
					this.setPuzzleEntry({ historyEntry, puzzleState });
					this.initializeGameEndStats(historyEntry);
					return historyEntry;
				}
			}
			const historyEntryUpdated = await this.addFinishedPuzzleToDb(historyEntry);
			this.setPuzzleEntry({ historyEntry: historyEntryUpdated, puzzleState });
			this.initializeGameEndStats(historyEntryUpdated);
			console.log('Puzzle saved to history.');
			return historyEntryUpdated;
		},
		async addFinishedPuzzleToDb(historyEntry) {
			try {
				const id = await StatsDB.add(historyEntry, true);
				if (id && typeof id === 'number') {
					historyEntry.id = id;
					return historyEntry;
				} else {
					console.error('Did not receive a correct id after saving history entry.');
					console.warn({ id });
				}
			} catch (e) {
				console.error(e);
				console.warn('Could not save history entry!');
				return historyEntry;
			}
		},

		async markFavorite(value = true) {
			if (!this.isSavedToDb) {
				console.warn('Cannot mark as favorite because puzzle is not saved to database.');
				return;
			}
			const { id, flags: currentFlags } = this.lastPuzzleEntry;
			const newFlags = { ...currentFlags, favorite: value ? 1 : 0 };
			try {
				const success = await StatsDB.update(id, {
					flags: { ...newFlags }
				});
				if (success) {
					console.log(`Succesfully set puzzle as "favorite = ${value}"`);
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

async function createGameEndStats({ width, height, difficulty, timeElapsed, id, initialBoard }) {

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
	const { sizeCount, difficultyCount } = sizeDifficultyResult;
	const { totalSolved, totalSolvedToday, sizesPlayed, difficultiesPlayed, puzzleConfigsPlayed } = totalsResult;

	const startOfToday = startOfDay(Date.now());
	const startOfTodayTimestamp = startOfToday.getTime();
	const countToday = items.filter(item => {
		return item.timestamp >= startOfTodayTimestamp;
	}).length;

	const count = items.length;
	const previousCount = previousItems.length;

	const { best, previousBest, average, previousAverage } = getBestAndAverageTimes({
		items, previousItems
	});

	const isTimeRecord = best < previousBest && best === timeElapsed;

	const { isReplay, previousPlays } = itemsWithSameInitialBoardResult;

	return {
		best, previousBest,
		average, previousAverage,
		count, previousCount, countToday,
		isTimeRecord,

		sizeCount,
		difficultyCount,
		
		totalSolved,
		totalSolvedToday,
		sizesPlayed,
		difficultiesPlayed,
		puzzleConfigsPlayed,

		isReplay,
		previousPlays
	};
}

async function getItemsWithSameInitialBoard({initialBoard, id}) {
	const previousPlays = await StatsDB.puzzleHistoryTable.where({
		initialBoard
	}).filter(item => id == null || item.id !== id).toArray();

	const isReplay = previousPlays.length > 0;
	return { isReplay, previousPlays };
}

async function getTotalSolved() {
	try {
		const totalSolved = await StatsDB.getCount();
		const sizes = await StatsDB.puzzleHistoryTable.orderBy('[width+height]').uniqueKeys();
		const difficulties = await StatsDB.puzzleHistoryTable.orderBy('difficulty').uniqueKeys();
		const sizeAndDifficulties = await StatsDB.puzzleHistoryTable.orderBy('[width+height+difficulty]').uniqueKeys();

		const startOfToday = startOfDay(Date.now());
		const startOfTodayTimestamp = startOfToday.getTime();

		const totalSolvedToday = await StatsDB.puzzleHistoryTable.where('timestamp').above(startOfTodayTimestamp).count();

		const sizesPlayed = sizes.map(([width, height]) => {
			const cells = width * height;
			return { width, height, cells };
		}).sort((a, b) => {
			return a.cells - b.cells;
		});
		const difficultiesPlayed = [...difficulties].sort((a, b) => {
			return a - b;
		})
		const puzzleConfigsPlayed = sizeAndDifficulties.map(([width, height, difficulty]) => {
			const cells = width * height;
			return { width, height, difficulty, cells };
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
			totalSolved: null,
			totalSolvedToday: 0,
			sizesPlayed: [],
			difficultiesPlayed: [],
			puzzleConfigsPlayed: []
		}
	}
}

async function getPuzzlesPlayedWithPuzzleConfig({ width, height, difficulty, id }) {
	try {
		const items = await StatsDB.puzzleHistoryTable
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

async function getPuzzleCountWithSizeOrDifficulty({ width, height, difficulty }) {
	try {
		const sizeCount = StatsDB.puzzleHistoryTable.where('[width+height]').equals([width, height]).count();
		const difficultyCount = StatsDB.puzzleHistoryTable.where('difficulty').equals(difficulty).count();
		
		return {
			sizeCount: await sizeCount,
			difficultyCount: await difficultyCount
		}
	} catch (e) {
		console.error(e);
		return { sizeCount: 0, difficultyCount: 0 };
	}
}

function getBestAndAverageTimes({ items, previousItems }) {
	if (!items.length) {
		return {
			best: null,
			previousBest: null,
			average: null,
			previousAverage: null
		}
	}
	const bestTimeItem = items[0];
	const previousBestTimeItem = previousItems?.[0] ?? null;

	const sum = items.reduce((acc, val) => acc + val.timeElapsed, 0);
	const previousSum = previousItems.reduce((acc, val) => acc + val.timeElapsed, 0);

	return {
		average: sum / items.length,
		previousAverage: previousSum ? previousSum / previousItems.length : null,

		best: bestTimeItem.timeElapsed,
		previousBest: previousBestTimeItem?.timeElapsed ?? null,
	}
}

const isSamePuzzleEntry = (a = {}, b = {}) => {
	return a.timestamp != null && a.timestamp === b.timestamp && a.initialBoard != null && a.initialBoard === b.initialBoard;
}