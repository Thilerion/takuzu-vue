import { computed, reactive, readonly, toRefs } from "vue";

const defaultFilterValues = () => ({
	timeRecord: null,
	boardSize: [],
	difficulty: [],
	favoritesOnly: false
})

export const useListFilters = () => {
	const filters = reactive(defaultFilterValues());

	const filterRefs = toRefs(filters);

	const activeFilters = computed(() => {
		const defaults = defaultFilterValues();
		const result = {};
		for (const [key, valueRef] of Object.entries(filterRefs)) {
			if (JSON.stringify(valueRef.value) === JSON.stringify(defaults[key])) continue;
			result[key] = valueRef.value;
		}
		return result;
	})

	const currentFiltersArray = computed(() => {
		return filterCategories.map(key => {
			const value = filters[key];
			return { key, value };
		})
	})

	const setFilter = (key, value) => {
		console.log('setting filter');
		console.log({ key, value });
		filters[key] = value;
	}
	const removeFilter = (key) => {
		filters[key] = defaultFilterValues()[key];
	}

	const filterFns = computed(() => {
		return [
			getTimeRecordFilter(filters.timeRecord),
			getBoardSizeFilter(filters.boardSize),
			getDifficultyFilter(filters.difficulty),
			getFavoritesFilter(filters.favoritesOnly)
		];
	})

	const filterItems = (items) => {
		return items.filter(i => {
			return filterFns.value.every(fn => fn(i));
		})
	}

	return {
		currentFilters: readonly(filters),
		activeFilters,
		filterFns,

		filterItems,
		setFilter,
		removeFilter
	}
}

function getTimeRecordFilter(selectedFilter) {
	if (selectedFilter === 'first') {
		return (item) => !!item.timeRecord?.first;
	} else if (selectedFilter === 'current') {
		return (item) => !!item.timeRecord?.current;
	} else if (selectedFilter === 'record') {
		return (item) => !!item.timeRecord?.record;
	} else return () => true;
}

function getBoardSizeFilter(selectedSizes) {
	if (!selectedSizes?.length) return () => true;

	return (item) => {
		return selectedSizes.includes(item.dimensions);
	}
}

function getDifficultyFilter(range) {
	if (range?.length !== 2) return () => true;
	return item => item.difficulty >= range[0] && item.difficulty <= range[1];
}
function getDifficultyFilterIncludes(selectedStars) {
	if (!selectedStars?.length) return () => true;
	return item => selectedStars.includes(item.difficulty);
}

function getFavoritesFilter(enabled) {
	if (!enabled) return () => true;
	return item => item?.flags?.favorite;
}