import { DIFFICULTY_LABELS } from "@/config";
import type { GameEndStats } from "./GameEndStats";
import { asDimensionsStr, formatPercentage, msToMinSec, msToSec } from "./helpers";
import { createRecapMessageConfig, type BaseRecapMessageConfig } from "./types";
import { formatLocaleOrdinal } from "@/i18n/format-ordinal";
import { isFirstEverSolved, isFirstOfDifficultySolved, isFirstSolvedWithPuzzleConfig, isFirstWithDimensionsSolved, isHardestEverSolved } from "./message-conditions/firsts.condition.js";
import { isAlmostTimeRecord, isSolvedWithLargeTimeRecordImprovement, isSolvedWithTimeRecordImprovement } from "./message-conditions/time-record.condition.js";
import { hasSolvedAmountInTotal, hasSolvedAmountToday, hasSolvedAmountWithConfigInTotal, hasSolvedAmountWithConfigToday, isFirstSolvedTodayGeneric, isFirstSolvedTodayInMorning } from "./message-conditions/num-plays.condition.js";
import { wasSolvedFasterThanAverage3Or5TimesConsecutively, wasSolvedFasterThanAverageMoreThanTenTimesConsecutively, wasSolvedFasterThanAverageTenTimesExactlyConsecutively, wasSolvedFasterThanAverageTime, wasSolvedMuchFasterThanAverageTime } from "./message-conditions/average.condition.js";
import { isInTop5PercentOfTimes, isTop5FastestTime } from "./message-conditions/rank.condition.js";

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
		type: 'notAddedToDbUnexpected',
		priority: 14,
		condition: (stats: Pick<GameEndStats, 'isSavedToDb' | 'hasCheatsUsed'>) => {
			// Checks if the game was not saved to the database, and this was not due to cheats being used
			if (!stats.isSavedToDb && !stats.hasCheatsUsed) return { success: true, data: null };
			return { success: false };
		},
		i18nKey: () => "Recap.message.notAddedToDbUnexpected"
	}),
	createRecapMessageConfig({
		type: 'firstTotal',
		priority: 20,
		condition: isFirstEverSolved,
		i18nKey: () => "Recap.message.firstTotal"
	}),

	createRecapMessageConfig({
		type: 'hardestEver',
		priority: 30,
		condition: isHardestEverSolved,
		i18nKey: () => "Recap.message.hardestEver"
	}),
	createRecapMessageConfig({
		type: 'firstOfDifficulty',
		priority: 30,
		condition: isFirstOfDifficultySolved,
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
		priority: 30,
		condition: isFirstWithDimensionsSolved,
		i18nKey: (data) => ({
			key: "Recap.message.firstOfSize",
			namedProperties: {
				dimensions: asDimensionsStr(data.width, data.height)
			}
		})
	}),

	// only applies if not first time playing this size and/or not first time playing this difficulty, but only when it is the first time this combination is played (due to lower priority)
	createRecapMessageConfig({
		type: 'firstOfSizeDifficulty',
		priority: 45,
		condition: isFirstSolvedWithPuzzleConfig,
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
		condition: isSolvedWithLargeTimeRecordImprovement,
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
		condition: isSolvedWithTimeRecordImprovement,
		i18nKey: (data) => {
			// TODO: percentageFaster sometimes?
			return {
				key: "Recap.message.timeRecord",
				namedProperties: {
					differenceSec: msToSec(data.timeImprovement)
				}
			}
		}
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
		condition: isAlmostTimeRecord,
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
		type: 'top5Time',
		priority: 150, // same as "almostTimeRecord"
		condition: isTop5FastestTime,
		i18nKey: (data) => {
			return {
				key: "Recap.message.top5Time",
				namedProperties: {
					rank: data.rank
				}
			}
		}
	}),

	// Prioritized above "fasterThanAverage more than 10 times consecutively", because it is shown at exactly 10 times.
	// This removes the drawback that it can be shown many times in a row.
	createRecapMessageConfig({
		type: 'fasterThanAverageConsecutivelyTenTimesExactly',
		priority: 175,
		condition: wasSolvedFasterThanAverageTenTimesExactlyConsecutively,
		i18nKey: ({ consecutiveTimes }) => ({
			key: "Recap.message.betterThanAverageConsecutivelyTenExact",
			namedProperties: { consecutiveTimes }
		})
	}),

	// Faster than average consecutively 11+ times has one drawback: it can potentially be shown at 11 times, 12 times, etc, which might get repetitive.
	// However, priority is equal to muchBetterThanAverage, and the chance one is faster than average so many times is, I think, low enough.
	createRecapMessageConfig({
		type: 'fasterThanAverageConsecutivelyMoreThanTenTimes',
		priority: 200,
		condition: wasSolvedFasterThanAverageMoreThanTenTimesConsecutively,
		i18nKey: ({ consecutiveTimes }) => ({
			key: "Recap.message.betterThanAverageConsecutivelyMoreThanTenTimes",
			namedProperties: { consecutiveTimes }
		})
	}),
	createRecapMessageConfig({
		type: 'muchBetterThanAverage',
		priority: 200,
		condition: wasSolvedMuchFasterThanAverageTime,
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
		type: 'top5Percent',
		priority: 200, // same as "muchBetterThanAverage"
		condition: isInTop5PercentOfTimes,
		i18nKey: (/* data */) => ({
			key: "Recap.message.top5Percent"
		})
	}),

	// In front of better than average, to reduce possibility that betterThanAverage is shown too often, when it might not be that important.
	createRecapMessageConfig({
		type: 'firstTodayMorning',
		priority: 250,
		condition: isFirstSolvedTodayInMorning,
		i18nKey: () => "Recap.message.firstTodayMorning"
	}),

	createRecapMessageConfig({
		type: 'fasterThanAverageConsecutiveTimesExactly',
		priority: 290, // just before "betterThanAverage"
		condition: wasSolvedFasterThanAverage3Or5TimesConsecutively,
		i18nKey: ({ consecutiveTimes }) => ({
			key: "Recap.message.fasterThanAverageConsecutiveTimesExactly",
			namedProperties: { consecutiveTimes }
		})
	}),

	createRecapMessageConfig({
		type: 'betterThanAverage',
		priority: 300,
		condition: wasSolvedFasterThanAverageTime,
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
		condition: hasSolvedAmountInTotal,
		i18nKey: (data) => ({
			key: "Recap.message.playsTotal",
			namedProperties: { totalSolved: data.totalSolved }
		})
	}),
	createRecapMessageConfig({
		type: 'playsToday',
		priority: 400,
		condition: hasSolvedAmountToday,
		i18nKey: (data) => ({
			key: "Recap.message.playsToday",
			namedProperties: { totalSolvedToday: data.totalSolvedToday }
		})
	}),
	createRecapMessageConfig({
		type: 'firstTodayGeneric',
		priority: 400,
		condition: isFirstSolvedTodayGeneric,
		i18nKey: () => "Recap.message.firstTodayGeneric"
	}),
	createRecapMessageConfig({
		type: 'playsConfigTotal',
		priority: 400,
		condition: hasSolvedAmountWithConfigInTotal,
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
		condition: hasSolvedAmountWithConfigToday,
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