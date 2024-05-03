import { statsDb } from "@/services/db/stats-db/init.js";
import { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";
import { differenceInMinutes, isYesterday } from "date-fns";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useStatisticsNextStore = defineStore('statisticsNext', () => {
	// Store when data/store was initialized, and if it is currently initialized or loading
	const initStatus = ref({
		at: null as Date | null,
		isInitialized: false,
	})
	const isInitialized = computed(() => initStatus.value.isInitialized);
	const isLoading = ref(false);
	const initializedAt = computed(() => initStatus.value.at);

	// Store the history items
	const historyItems = ref<StatsDbExtendedStatisticDataEntry[] | null>(null);

	// Getters
	const numSolved = computed(() => historyItems.value?.length ?? 0);
	const noPuzzlesSolved = computed(() => numSolved.value === 0);

	// Actions
	function reset() {
		initStatus.value = { at: null, isInitialized: false };
		isLoading.value = false;
		historyItems.value = null;
	}
	function setInitialized(value: boolean) {
		if (value) {
			initStatus.value = {
				at: new Date(),
				isInitialized: true,
			}
		} else {
			initStatus.value = {
				at: null,
				isInitialized: false,
			}
		}		
	}
	
	async function initialize({ forceUpdate = false } = {}) {
		if (isLoading.value) return;

		// First, check if a reset is required
		const needReset = forceUpdate || statisticsAreStaleByDate({
			isLoading: isLoading.value,
			isInitialized: isInitialized.value,
			initDate: initStatus.value.at,
		});
		if (needReset) reset();

		// Then, check if we need to load the history items, by checking the amount of puzzlesSolved, and comparing it to what is currently stored
		isLoading.value = true;

		try {
			const numSolved = await statsDb.getTotalSolved();
			if (!numSolved) {
				// No puzzles solved
				historyItems.value = [];
				setInitialized(true);
				return;
			}
			const items = await getAllItems();
			historyItems.value = items;
			setInitialized(true);
		} catch(e) {
			throw new Error('Failed to initialize statistics store.', { cause: e });
		} finally {
			isLoading.value = false;
		}
	}

	return {
		isLoading,
		isInitialized,
		initializedAt,
		
		numSolved,
		noPuzzlesSolved,

		historyItems,

		// Actions
		initialize,
		reset,
	}
})

function statisticsAreStaleByDate({
	isLoading, isInitialized, initDate
}: { isLoading: boolean, initDate: Date | null, isInitialized: boolean }): boolean {
	// If the store is currently loading, it is not stale; new data is being loaded already
	if (isLoading) return false;
	// If the store is not initialized, or if initializedDate is null, or if initializedDate is too long ago, it is stale
	if (!isInitialized || initDate == null) return true;

	// If the store was initialized more than 1 hour ago, or it was initialized "yesterday", it is stale
	if (isYesterday(initDate)) return true;
	if (differenceInMinutes(new Date(), initDate) > 60) return true;
	return false;
}
async function getAllItems() {
	const all = await statsDb.getAll();
	return all.map(item => new StatsDbExtendedStatisticDataEntry(item));
}