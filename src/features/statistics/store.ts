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
	// TODO: Should I use shallowRef for the historyItems instead? Depends on the item update mechanism of the Statistics page components
	const historyItems = ref<StatsDbExtendedStatisticDataEntry[] | null>(null);
	const itemsRecentFirst = computed(() => {
		if (!historyItems.value) return [];
		return [...historyItems.value].sort((a, b) => b.timestamp - a.timestamp);
	})

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
			const currentNumSolved = await statsDb.getTotalSolved();
			if (!currentNumSolved) {
				// No puzzles solved
				historyItems.value = [];
				setInitialized(true);
				return;
			} else if (currentNumSolved === numSolved.value) {
				// No new puzzles solved, assume the data is up-to-date
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

	// Actions that update/change the database items themselves
	async function updateNote(itemId: number, note: string | undefined) {
		const success = await statsDb.updateItem(itemId, { note });
		if (!success) {
			console.error('Failed to save note to database.', { itemId, note });
			return false;
		}
		const item = historyItems.value!.find(i => i.id === itemId);
		if (item == null) {
			throw new Error('Updated item note, but it was not found in the store.');
		}
		item.note = note;
		return true;
	}
	async function toggleFavorite(itemId: number, value: boolean) {
		const dbVal = value ? 1 : 0;
		const success = await statsDb.updateItem(itemId, {
			'flags.favorite': dbVal
		});
		if (!success) {
			console.error('Failed to save favorite status to database.', { itemId, value, dbVal });
			return false;
		}
		const item = historyItems.value!.find(i => i.id === itemId);
		if (item == null) {
			throw new Error('Updated item favorite status, but it was not found in the store.');
		}
		item.flags = {
			...item.flags,
			favorite: !!dbVal
		}
		return true;
	}

	return {
		isLoading,
		isInitialized,
		initializedAt,
		
		numSolved,
		noPuzzlesSolved,

		historyItems,
		itemsRecentFirst,

		// Actions
		initialize,
		reset,

		updateNote,
		toggleFavorite,
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