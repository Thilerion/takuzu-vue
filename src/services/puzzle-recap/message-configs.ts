import { DIFFICULTY_LABELS } from "@/config";
import type { GameEndStats } from "./GameEndStats";
import { asDimensionsStr, formatPercentage, getPercentageFaster, getPercentageSlower, isMultipleOf, msToMinSec, msToSec } from "./helpers";
import { createRecapMessageConfig, type BaseRecapMessageConfig } from "./types";
import { formatLocaleOrdinal } from "@/i18n/format-ordinal";

export const recapMessageConfigs = [
	createRecapMessageConfig({
		type: 'notAddedToDbCheatsUsed',
		priority: 10,
		condition: (stats: Pick<GameEndStats, 'isSavedToDb' | 'hasCheatsUsed'>) => {
			if (!stats.isSavedToDb && stats.hasCheatsUsed) return { success: true, data: null };
			return { success: false };
		},
		i18nKey: () => "Recap.message.notAddedToDbCheats"
	}),
	createRecapMessageConfig({
		type: 'firstTotal',
		priority: 20,
		condition: (stats: Pick<GameEndStats, 'totals'>) => {
			const totalSolved = stats.totals.amount;
			if (totalSolved === 1) return {
				success: true,
				data: { totalSolved }
			}
			return { success: false }
		},
		i18nKey: () => "Recap.message.firstTotal"
	}),

	createRecapMessageConfig({
		type: 'hardestEver',
		priority: 30,
		condition: (stats: Pick<GameEndStats, 'isCurrentPuzzleHardestEverPlayed' | 'isFirstSolvedWithPuzzleConfig'>) => {
			// applies not only when the difficulty is the highest difficulty ever solved, but also when this difficulty has already been played, but now it's been played on a larger board
			if (!stats.isFirstSolvedWithPuzzleConfig()) {
				return { success: false };
			}
			const isHardestEver = stats.isCurrentPuzzleHardestEverPlayed();
			if (isHardestEver) {
				return { success: true, data: null };
			}
			return { success: false };
		},
		i18nKey: () => "Recap.message.hardestEver"
	}),
	createRecapMessageConfig({
		type: 'firstOfDifficulty',
		priority: 40,
		condition: (stats: Pick<GameEndStats, 'isFirstSolvedWithDifficulty' | 'historyEntry'>) => {
			if (!stats.isFirstSolvedWithDifficulty()) return { success: false };
			return {
				success: true,
				data: {
					difficulty: stats.historyEntry.difficulty
				}
			};
		},
		i18nKey: ({ difficulty }) => {
			return {
				key: "Recap.message.firstOfDifficulty",
				namedProperties: {
					difficultyKey: `Game.difficulty.${DIFFICULTY_LABELS[difficulty]}`
				}
			}
		}
	}),
	createRecapMessageConfig({
		type: 'firstOfSize',
		priority: 40,
		condition: (stats: Pick<GameEndStats, 'isFirstSolvedWithSize' | 'historyEntry'>) => {
			if (!stats.isFirstSolvedWithSize()) return { success: false };
			const { width, height } = stats.historyEntry;
			return {
				success: true,
				data: { width, height }
			};
		},
		i18nKey: () => "Recap.message.firstOfSize"
	}),

	// only applies if not first time playing this size and/or not first time playing this difficulty, but only when it is the first time this combination is played (due to lower priority)
	createRecapMessageConfig({
		type: 'firstOfSizeDifficulty',
		priority: 45,
		condition: (stats: Pick<GameEndStats, 'isFirstSolvedWithPuzzleConfig' | 'historyEntry'>) => {
			if (!stats.isFirstSolvedWithPuzzleConfig()) return { success: false };
			const { width, height, difficulty } = stats.historyEntry;
			return {
				success: true,
				data: { width, height, difficulty }
			};
		},
		i18nKey: ({ width, height, difficulty }) => {
			return {
				key: "Recap.message.firstOfSizeDifficulty",
				namedProperties: {
					difficultyKey: `Game.difficulty.${DIFFICULTY_LABELS[difficulty]}`,
					dimensions: asDimensionsStr(width, height)
				}
			}			
		}
	}),

	createRecapMessageConfig({
		type: 'timeRecordLarge',
		priority: 50,
		condition: (stats) => {
			if (!stats.bestAndAverage.isTimeRecord) return { success: false };
			const { best, previousBest } = stats.bestAndAverage;
			if (previousBest == null) return { success: false };
			const time = stats.historyEntry.timeElapsed;
			const improvement = previousBest - time;
			const percentageFaster = getPercentageFaster(previousBest, time);

			if (percentageFaster < 0.35 && improvement < 10000) return { success: false };

			return {
				success: true,
				data: { time, best, previousBest, improvement, percentageFaster }
			};
		},
		i18nKey: (data, locale) => {
			// TODO: sometimes display as percentage, sometimes as seconds
			return {
				key: "Recap.message.timeRecordLarge",
				namedProperties: {
					improvementPercentage: formatPercentage(data.percentageFaster, { maxDigits: 0, locale }),
				}
			}
		}
	}),
	createRecapMessageConfig({
		type: 'timeRecord',
		priority: 60,
		condition: (stats: Pick<GameEndStats, 'bestAndAverage' | 'historyEntry'>) => {
			if (!stats.bestAndAverage.isTimeRecord) return { success: false };
			const { best, previousBest } = stats.bestAndAverage;
			if (previousBest == null) return { success: false };
			const time = stats.historyEntry.timeElapsed;
			const improvement = previousBest - time;
			const percentageFaster = getPercentageFaster(previousBest, time);
			return {
				success: true,
				data: { time, best, previousBest, improvement, percentageFaster }
			};
		},
		i18nKey: () => "Recap.message.timeRecord"
	}),
	createRecapMessageConfig({
		type: 'replayTimeRecord',
		priority: 100,
		condition: (stats: Pick<GameEndStats, 'replayStats' | 'historyEntry'>) => {
			const { isReplay, previousPlays } = stats.replayStats;
			if (!isReplay) return { success: false };
			const bestPreviousTime = Math.min(...previousPlays.map(val => val.timeElapsed));
			const time = stats.historyEntry.timeElapsed;
			const difference = bestPreviousTime - time;
			if (difference <= 0) return { success: false };
			const numPlays = previousPlays.length;
			return {
				success: true,
				data: { numPlays, difference, time }
			};
		},
		i18nKey: (data, locale) => {
			const numPlaysOrdinal = formatLocaleOrdinal(data.numPlays + 1, locale);
			const differenceSec = msToSec(data.difference);
			return {
				key: "Recap.message.replayTimeRecord",
				namedProperties: { numPlaysOrdinal, differenceSec }
			}
		}
	}),


	createRecapMessageConfig({
		type: 'almostTimeRecord',
		priority: 150,
		condition: (stats) => {
			const count = stats.currentCounts.count;
			// if less than 10 played, "almostTimeRecord" is not relevant enough
			if (count < 10) return { success: false };
			const { timeElapsed } = stats.historyEntry;
			const { isTimeRecord, best, average } = stats.bestAndAverage;

			// can not be "almost" timeRecord if it is the best time
			if (isTimeRecord) return { success: false };
			// if the time is slower than average, "almostTimeRecord" is too positive
			if (timeElapsed > average) return { success: false };

			console.log('checking for almost time record');

			const timeDifference = timeElapsed - best;
			const percentageDifference = getPercentageSlower(best, timeElapsed);

			const isSuccessByPercentage = timeDifference < 6000 && percentageDifference < 0.05;
			const isSuccessByTime = timeDifference < 800 && percentageDifference < 0.20;

			console.log({ timeDifference, percentageDifference, isSuccessByPercentage, isSuccessByTime });

			if (isSuccessByPercentage || isSuccessByTime) {
				return {
					success: true,
					data: {
						timeSlower: timeDifference,
						percentageSlower: percentageDifference,

						byPercentage: isSuccessByPercentage,
						byTime: isSuccessByTime,

						timeElapsed, best
					}
				};
			} else {
				return { success: false };
			}
		},
		i18nKey: (data, locale): { key: string, namedProperties: Record<string, string | number > } => {
			const {
				timeSlower, percentageSlower,
				byPercentage, byTime,
			} = data;

			let messageType: 'time' | 'percentage';

			if (byTime && !byPercentage) {
				messageType = 'time';
			} else if (!byTime && byPercentage) {
				messageType = 'percentage';
			} else {
				// default to time
				messageType = 'time';
			}

			if (messageType === 'time') {
				return {
					key: "Recap.message.almostTimeRecordAbsolute",
					namedProperties: {
						differenceSec: msToSec(timeSlower), // TODO: format seconds with locale
					}
				}
			} else {
				return {
					key: "Recap.message.almostTimeRecordPercentage",
					namedProperties: {
						differencePercentage: formatPercentage(percentageSlower, { maxDigits: 0, locale })
					}
				}
			}
		}
	}),

	createRecapMessageConfig({
		type: 'muchBetterThanAverage',
		priority: 200,
		condition: (stats) => {
			const count = stats.currentCounts.count;
			// if less than 6 played, "muchBetterThanAverage" is not relevant enough
			if (count < 6) return { success: false };
			const { timeElapsed } = stats.historyEntry;
			const { isTimeRecord, previousAverage: average } = stats.bestAndAverage;
			if (average == null) {
				// shouldn't happen, as count > 5, but just in case
				return { success: false };
			}

			if (isTimeRecord) return { success: false };
			if (timeElapsed >= average) return { success: false };

			const timeDifference = average - timeElapsed; // time faster than average
			const percentageDifference = getPercentageFaster(average, timeElapsed);

			const success = 
				(timeDifference > 45000) ||
				(timeDifference > 30000 && percentageDifference > 0.5) ||
				(timeDifference > 10000 && percentageDifference > 0.3);

			if (!success) return { success: false };
			return {
				success: true,
				data: {
					timeElapsed, average,
					timeDifference, percentageDifference
				}
			}
		},
		i18nKey: (data, locale): { key: string, namedProperties: Record<string, string | number > } => {
			const { percentageDifference, timeDifference } = data;
			let usePercentage = false;
			// TODO: better logic for when to use percentage
			if (timeDifference > 120_000 && percentageDifference > 0.5) {
				usePercentage = true;
			} else if (timeDifference < 30000 && percentageDifference > 0.3) {
				usePercentage = true;
			}

			if (usePercentage) {
				return {
					key: "Recap.message.muchBetterThanAveragePercentage",
					namedProperties: {
						improvementPercentage: formatPercentage(percentageDifference, { maxDigits: 0, locale })
					}
				}
			} else {
				// TODO: use minutes:seconds when more than 1 minute
				return {
					key: "Recap.message.muchBetterThanAverageAbsolute",
					namedProperties: {
						differenceSec: msToSec(timeDifference)
					}
				}
			}
		}
	}),

	createRecapMessageConfig({
		type: 'betterThanAverage',
		priority: 300,
		condition: (stats) => {
			const count = stats.currentCounts.count;
			// if less than 4 played, "betterThanAverage" is not relevant enough
			if (count < 4) return { success: false };
			const { timeElapsed } = stats.historyEntry;
			const { isTimeRecord, previousAverage: average } = stats.bestAndAverage;
			// shouldn't happen, as count > 3, but just in case
			if (average == null) return { success: false };
			if (isTimeRecord || timeElapsed >= average) return { success: false };

			const timeDifference = average - timeElapsed; // time faster than average
			if (timeDifference <= 0) return { success: false };
			return {
				success: true,
				data: {
					timeElapsed, previousAverage: average,
					timeDifference
				}
			}
		},
		i18nKey: (data) => ({
			key: "Recap.message.betterThanAverage",
			namedProperties: {
				differenceSec: msToSec(data.timeDifference)
			}
		})
	}),

	createRecapMessageConfig({
		type: 'replayPlaysTotal',
		priority: 350,
		condition: (stats: Pick<GameEndStats, 'replayStats'>) => {
			const { isReplay, previousPlays } = stats.replayStats;
			if (!isReplay) return { success: false };
			const numPlays = previousPlays.length;
			const replayBest = Math.min(...previousPlays.map(val => val.timeElapsed));
			return {
				success: true,
				data: {
					numPlays, replayBest
				}
			}
		},
		i18nKey: (data, locale) => {
			const bestPreviousTimeMinSec = msToMinSec(data.replayBest);
			const numPlaysOrdinal = formatLocaleOrdinal(data.numPlays + 1, locale);
			return {
				key: "Recap.message.replayPlaysTotal",
				namedProperties: {
					bestPreviousTimeMinSec, numPlaysOrdinal
				}
			}
		}
	}),

	// group of messages for amount of plays
	createRecapMessageConfig({
		type: 'playsTotal',
		priority: 400,
		condition: (stats) => {
			const totalSolved = stats.totals.amount;
			let success = false;
			if (totalSolved <= 50 && isMultipleOf(totalSolved, 5)) {
				// 5, 10, ..., 50
				success = true;
			} else if (totalSolved > 50 && totalSolved <= 150 && isMultipleOf(totalSolved, 25)) {
				// 75, 100, 125, 150
				success = true;
			} else if (totalSolved > 150 && isMultipleOf(totalSolved, 50)) {
				// 200, 250, 300, ...
				success = true;
			}
			if (!success) return { success: false };
			return { success: true, data: { totalSolved } };
		},
		i18nKey: (data) => ({
			key: "Recap.message.playsTotal",
			namedProperties: { totalSolved: data.totalSolved }
		})
	}),
	createRecapMessageConfig({
		type: 'playsToday',
		priority: 400,
		condition: (stats) => {
			const totalSolvedToday = stats.totals.today;
			if (isMultipleOf(totalSolvedToday, 5) && totalSolvedToday >= 5) return { success: true, data: { totalSolvedToday } };
			return { success: false };
		},
		i18nKey: (data) => ({
			key: "Recap.message.playsToday",
			namedProperties: { totalSolved: data.totalSolvedToday }
		})
	}),
	createRecapMessageConfig({
		type: 'playsConfigTotal',
		priority: 400,
		condition: (stats) => {
			const count = stats.currentCounts.count;
			let success = false;
			if (count >= 10 && count <= 50 && isMultipleOf(count, 10)) {
				// 10, 20, ..., 50
				success = true;
			} else if (count > 50 && count <= 250 && isMultipleOf(count, 25)) {
				// 75, 100, 125, ..., 250
				success = true;
			} else if (count > 250 && isMultipleOf(count, 50)) {
				// 300, 350, 400, ...
				success = true;
			}
			if (!success) return { success: false };
			const { width, height, difficulty } = stats.historyEntry;
			return { success: true, data: { count, width, height, difficulty } };
		},
		i18nKey: ({ count, width, height, difficulty }) => {
			const difficultyKey = `Game.difficulty.${DIFFICULTY_LABELS[difficulty]}`;
			const dimensions = asDimensionsStr(width, height);
			return {
				key: "Recap.message.playsConfigTotal",
				namedProperties: { count, dimensions, difficultyKey }
			}
		}
	}),
	createRecapMessageConfig({
		type: 'playsConfigToday',
		priority: 400,
		condition: (stats) => {
			const count = stats.currentCounts.today;

			if (isMultipleOf(count, 5) && count >= 5) {
				// 5, 10, 15,...
				const { width, height, difficulty } = stats.historyEntry;
				return {
					success: true,
					data: {
						count, width, height, difficulty
					}
				}
			}
			return { success: false };			
		},
		i18nKey: ({ count, width, height, difficulty }) => {
			const difficultyKey = `Game.difficulty.${DIFFICULTY_LABELS[difficulty]}`;
			const dimensions = asDimensionsStr(width, height);
			return {
				key: "Recap.message.playsConfigToday",
				namedProperties: { count, dimensions, difficultyKey }
			}
		}
	}),

	createRecapMessageConfig({
		type: 'default',
		priority: Infinity,
		condition: () => ({ success: true, data: null }),
		i18nKey: () => null
	})

] as const satisfies BaseRecapMessageConfig<string, any>[];

export type RecapMessageConfig = typeof recapMessageConfigs[number];
export type RecapMessageConfigType = RecapMessageConfig['type'];