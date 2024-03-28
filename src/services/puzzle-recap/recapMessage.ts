import { usePuzzleRecapStore } from "@/stores/puzzle-recap";
import { recapMessageConfigs } from "./message-configs";
import { pickRandom } from "@/utils/random.utils";

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

export function getRecapMessage() {
	const store = usePuzzleRecapStore();
	const stats = store.gameEndStats!;

	for (const group of getGroupedRecapMessageConfigs()) {
		const successes: Extract<(ReturnType<typeof recapMessageConfigs[number]['evaluate']>), { success: true }>[] = [];

		for (const conf of group) {
			const result = conf.evaluate(stats);
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