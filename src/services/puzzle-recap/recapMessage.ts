import { recapMessageConfigs, type RecapMessageConfigType } from "./message-configs";
import { pickRandom } from "@/utils/random.utils";
import type { GameEndStats } from "./GameEndStats.js";

function getGroupedRecapMessageConfigs() {
	const groupedConfigsObj: Record<number, (typeof recapMessageConfigs[number])[]> = {};

	for (const conf of recapMessageConfigs) {
		if (!groupedConfigsObj[conf.priority]) {
			groupedConfigsObj[conf.priority] = [];
		}
		groupedConfigsObj[conf.priority].push(conf);
	}

	const groupedConfigs = Object.values(groupedConfigsObj).sort((a, b) => {
		return a[0].priority - b[0].priority;
	})
	return groupedConfigs;
}

export function getRecapMessage(gameEndStats: GameEndStats, filterRecapMessageConfig?: (type: RecapMessageConfigType) => boolean) {
	const filterFn = filterRecapMessageConfig ?? (() => true);

	for (const group of getGroupedRecapMessageConfigs()) {
		const successes: Extract<(ReturnType<typeof recapMessageConfigs[number]['evaluate']>), { success: true }>[] = [];

		for (const conf of group) {
			if (!filterFn(conf.type)) continue;
			const result = conf.evaluate(gameEndStats);
			if (result.success) {
				successes.push(result);
			}
		}
		if (successes.length === 0) continue;
		else if (successes.length === 1) return successes[0];
		else {
			console.log("Multiple recap messages found", successes);
			return pickRandom(successes);
		}
	}

	// default should have returned by now
	throw new Error("No recap message found");
}