import type { GameEndStats } from "@/services/puzzle-recap/GameEndStats.js";
import { recapMessageConfigs } from "@/services/puzzle-recap/message-configs.js"

describe('recapMessageConfigs array', () => {
	it('is already sorted by priority', () => {
		const configs = recapMessageConfigs;
		let priority = -Infinity;
		for (const config of configs) {
			expect(config.priority).toBeGreaterThanOrEqual(priority);
			priority = config.priority;
		}
	})

	it('ends with priority Infinity, and type "default"', () => {
		const last = recapMessageConfigs.at(-1)!;
		expect(last.priority).toBe(Infinity);
		expect(last.type).toBe('default');
	})

	test('the default message always returns success', () => {
		const last = recapMessageConfigs.at(-1)!;
		const result = last.evaluate({} as GameEndStats);
		expect(result.success).toBe(true);
	})
})