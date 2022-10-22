import { almostTimeRecordAbsolute, almostTimeRecordPercentage, defaultRecapGen, firstOfDifficulty, firstOfSize, firstTotal, firstWithSizeDifficulty, hardestEver, isBetterThanAverage, muchBetterThanAverageAbsolute, muchBetterThanAveragePercentage, notAddedToDbCheats, playsConfigToday, playsConfigTotal, playsToday, playsTotal, replayPlaysTotal, replayTimeRecord, timeRecord, timeRecordLarge, type RecapGenerator } from './generators';
import { pickRandomly } from './helpers';
import { checkPuzzleNewRecord } from './records';
import type { AppliesRequiredData, RecapMsgType } from './types';

const recapFnsOrdered: (RecapGenerator | RecapGenerator[])[] = [
	notAddedToDbCheats,
	firstTotal,
	[
		hardestEver,
		firstOfDifficulty,
		firstOfSize,
		firstWithSizeDifficulty,
	],
	timeRecordLarge,
	timeRecord,
	replayTimeRecord,
	almostTimeRecordAbsolute,
	almostTimeRecordPercentage,
	muchBetterThanAverageAbsolute,
	muchBetterThanAveragePercentage,
	isBetterThanAverage,
	replayPlaysTotal,
	[
		playsTotal,
		playsToday,
		playsConfigTotal,
		playsConfigToday,
	],
]

type RecapMsgRes = {
	type: RecapMsgType,
	ctx: {
		result: true
	},
	message: string
}

export function getRecapMessage(data: AppliesRequiredData): RecapMsgRes {
	for (const item of recapFnsOrdered) {
		if (Array.isArray(item)) {
			const results = getAll(item, data);
			const picked = pickRandomly(results);
			if (picked != null) {
				const res = picked();
				return res;
			}
		} else {
			const res = item.fn(data);
			if (res != null) {
				return res();
			}
		}
	}
	const defaulted = defaultRecapGen.fn(data)!;
	return defaulted();
}

export function getRecapData(data: AppliesRequiredData) {
	return {
		...getRecapMessage(data),
		record: checkPuzzleNewRecord(data)
	}
}

function getAll(group: RecapGenerator[], data: AppliesRequiredData)  {
	return group.map(item => {
		return item.fn(data);
	}).filter(isNotNull);
}

function isNotNull<T>(val: T | null): val is T {
	return val != null;
} 