import type { GameEndStats } from "./GameEndStats";
import type { RecapMessageConfigType } from "./message-configs";

export function getRecordMessage(
	recapMessageType: RecapMessageConfigType,
	gameEndStats: GameEndStats
): {
	show: false;
} | {
	show: true;
	key: string;
} {
	// first time solved using this puzzle config, or first ever puzzle solved in total
	if (
		gameEndStats.currentCounts.count === 1 ||
		gameEndStats.totals.amount === 1 ||
		recapMessageType === 'firstTotal'
	) {
		// first time solving this puzzle config
		return {
			show: true,
			key: "Recap.record.first-puzzle-solved"
		};
	} else if (recapMessageType === 'timeRecord' || recapMessageType === 'timeRecordLarge') {
		return {
			show: true,
			key: 'Recap.record.new-time-record'
		}
	}

	return { show: false };
}