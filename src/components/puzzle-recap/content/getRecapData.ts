import type { DifficultyKey } from "@/lib/types";
import type { DbHistoryEntry } from "@/services/stats/db/models";
import { useRecapStatsStore } from "@/stores/recap-stats";
import { storeToRefs } from "pinia";
import { computed, reactive, toRef, toRefs, type ComputedRef } from "vue";

export interface RecapDataInitialized {
	count: number,
	currentTimeElapsed: number,
	best: number,
	previousBest: number,
	average: number,

	isFavorite: boolean,
	isSavedToDb: boolean,
	lastPuzzleEntry: DbHistoryEntry,
	note: string | undefined,
	difficulty: DifficultyKey,
	width: number,
	height: number
}
export type RecapData = { initialized: false, data: null } | { initialized: true, data: RecapDataInitialized };

export const useRecapData = (): RecapData => {
	const recapStatsStore = useRecapStatsStore();
	const initialized = toRef(recapStatsStore, 'initialized');

	const {
		// isTimeRecord,
		count,
		currentTimeElapsed, best, previousBest, average,
		// previousAverage,
		isFavorite, isSavedToDb, lastPuzzleEntry
	} = storeToRefs(recapStatsStore);
	const note = computed(() => {
		// must be computed (not ref), because note property may not be set on the lastPuzzleEntry
		const entry = recapStatsStore.lastPuzzleEntry;
		if ('note' in entry) {
			return entry.note;
		}
		return undefined;
	})
	const {
		difficulty, width, height
	} = toRefs(lastPuzzleEntry.value);

	const res = reactive({
		initialized,
		count, currentTimeElapsed, best, previousBest, average,
		isFavorite, isSavedToDb, lastPuzzleEntry,
		note,
		difficulty, width, height
	}) as unknown as RecapDataInitialized;

	const res2 = reactive({
		initialized,
		data: res
	});

	return res2 as { initialized: false, data: null } | { initialized: true, data: RecapDataInitialized };
}