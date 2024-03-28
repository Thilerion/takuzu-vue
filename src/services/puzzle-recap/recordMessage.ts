import type { GameEndStats } from "./GameEndStats";
import type { RecapMessageConfigType } from "./message-configs";

export function getRecordMessage(
	type: RecapMessageConfigType,
	gameEndStats: GameEndStats
): {
	show: false;
} | {
	show: true;
	key: string;
	} {
	if (gameEndStats.currentCounts.count === 1) {
		// first time solving this puzzle config
		return {
			show: true,
			key: "Recap.record.first-puzzle-solved"
		};
	}
	
	switch (type) {
		case 'firstTotal': {
			return {
				show: true,
				key: "Recap.record.first-puzzle-solved"
			}
		}
		case 'timeRecord':
		case 'timeRecordLarge': {
			return {
				show: true,
				key: 'Recap.record.new-time-record'
			}
		}
		default: {
			return { show: false };
		}
	}
}