import { useStorage, useTimestamp } from "@vueuse/core";
import { computed, toRefs } from "vue"

interface FirstVisitData {
	firstVisitTimestamp: ReturnType<typeof Date.now>,
	handledFirstVisit: boolean,
	visits: number
}
const defaultData = {
	firstVisitTimestamp: Date.now(),
	handledFirstVisit: false,
	visits: 0,
}
const firstVisitData = useStorage<FirstVisitData>('takuzu_handled-first-visit', {...defaultData}, localStorage, {
	writeDefaults: true,
});

firstVisitData.value.visits += 1;
firstVisitData.value = {
	...defaultData,
	...firstVisitData.value
};

export const useIsFirstVisit = () => {
	const isFirstVisit = computed(() => firstVisitData.value.visits === 1);

	const {
		visits, handledFirstVisit, firstVisitTimestamp: timestamp
	} = toRefs(firstVisitData.value);

	return {
		isFirstVisit,
		handledFirstVisit,
		visits,
		timestamp
	}
}

export const useTimeSinceFirstVisit = () => {
	const now = useTimestamp({ interval: 1000 });
	const first = computed(() => firstVisitData.value.firstVisitTimestamp);
	return computed(() => {
		return now.value - first.value;
	})
}