<template>
	<div class="mb-4 gap-y-4 grid v-grid-bleed bleed-grid-4">
		<div class="text-sm">
			<!-- <div class="text-base">Shown items:</div> -->

			<h3>Group by:</h3>
			<div class="py-2">
				<div class="pl-1.5 pr-4 py-1.5 inline-flex flex-row items-center gap-2 rounded-full bg-gray-200 radio-wrapper mr-2" :class="{checked: itemType === 'puzzleConfig'}">
					<input type="radio" id="itemTypeRadioPuzzleConfig" value="puzzleConfig" v-model="itemType" />
					<label for="itemTypeRadioPuzzleConfig">Size + difficulty</label>
				</div>
				<div class="pl-1.5 pr-4 py-1.5 inline-flex flex-row items-center gap-2 rounded-full bg-gray-200 radio-wrapper" :class="{checked: itemType === 'size'}">
					<input type="radio" id="itemTypeRadioSize" value="size" v-model="itemType" />
					<label for="itemTypeRadioSize">Size</label>
				</div>
			</div>

			<h3 class="mt-2">Show statistics from:</h3>
			<div class="flex flex-row flex-wrap gap-2 w-fit max-w-sm py-2">

				<div class="pl-1.5 pr-4 py-1.5 inline-flex flex-row items-center gap-2 rounded-full bg-gray-200 radio-wrapper" :class="{checked: listType === 'allTime'}">
					<input type="radio" id="allTimeRadio" value="allTime" v-model="listType" />
					<label for="allTimeRadio">All-time</label>
				</div>

				<div class="pl-1.5 pr-4 py-1.5 inline-flex flex-row items-center gap-2 rounded-full bg-gray-200 radio-wrapper" :class="{checked: listType === 'recent90Days'}">
					<input type="radio" id="recentRadio90" value="recent90Days" v-model="listType" />
					<label for="recentRadio90">Last 90 days</label>
				</div>

				<div class="pl-1.5 pr-4 py-1.5 inline-flex flex-row items-center gap-2 rounded-full bg-gray-200 radio-wrapper" :class="{checked: listType === 'recent30Days'}">
					<input type="radio" id="recentRadio30" value="recent30Days" v-model="listType" />
					<label for="recentRadio30">Last 30 days</label>
				</div>

			</div>

		</div>
		<div class="mb-4 full-bleed" v-if="true">
			<!-- <h3 class="font-medium text-lg px-4 pb-2">List</h3> -->
			<BaseTable
				:columns="[
					{ label: 'Size', sortable: !!mergeDifficulties, key: 'size' },
					{ label: 'Count', sortable: true, key: 'count' },
					{ label: 'Count%', sortable: true, key: 'pCount' },
					{ label: 'Time%', sortable: true, key: 'pTime' },
					{ label: 'Fav%', sortable: true, key: 'pFavScore' },
					{ label: 'Cells', sortable: true, key: 'cells' },
					{ label: 'Time/100 cells', sortable: true, key: 'timePer100Cells' }
				]"
				:rows="tableRows"
				:current-sort="{ key: sortProp, dir: sortDir }"
				@sort-header="setSortProp"
			/>
		</div>
	</div>
</template>

<script setup>
import { getMostPlayedPuzzleConfigs, getMostPlayedPuzzleSizes } from '@/services/stats/most-played';
import { useStatisticsStore } from '@/stores/statistics';
import { isBefore, subDays } from 'date-fns/esm';
import { computed, ref, toRef, watch } from 'vue';

import { formatTimeMMSS } from '@/utils/date.utils';
import { useStorage } from '@vueuse/core';

const statsStore = useStatisticsStore();

const listType = useStorage('takuzu_most-played-list-type', 'recent30Days', sessionStorage);
const itemType = useStorage('takuzu_most-played-item-type', 'puzzleConfig', sessionStorage);

const mergeDifficulties = computed(() => {
	return itemType.value === 'size';
})

const sortedByDate = toRef(statsStore, 'sortedByDate');
const itemsSorted = computed(() => sortedByDate.value.filter(item => {
	if (item.difficulty > 3) return false;
	if (item.difficulty === 3 && item.width <= 7 && item.height <= 7) return false;
	return true;
}))
const recentItems = computed(() => {
	return itemsSorted.value.slice(0, 1000);
})
const recentItems30Days = computed(() => {
	const timestamp = subDays(new Date(), 30);
	const idx = itemsSorted.value.findIndex(item => {
		return isBefore(item.date, timestamp);
	})
	if (idx <= 0) {
		console.error('Not enough recent items, returning one anyway.');
		return [itemsSorted.value[0]];
	}
	return itemsSorted.value.slice(0, idx);
})
const recentItems90Days = computed(() => {
	const timestamp = subDays(new Date(), 90);
	const idx = itemsSorted.value.findIndex(item => {
		return isBefore(item.date, timestamp);
	})
	if (idx <= 0) {
		console.error('Not enough recent items, returning one anyway.');
		return [itemsSorted.value[0]];
	}
	return itemsSorted.value.slice(0, idx);
})

const summaryFn = computed(() => {
	if (mergeDifficulties.value) return getMostPlayedPuzzleSizes;
	return getMostPlayedPuzzleConfigs;
})

const mostPlayedAllTime = computed(() => summaryFn.value(itemsSorted.value));
const mostPlayedRecent = computed(() => summaryFn.value(recentItems.value));
const mostPlayedRecent30Days = computed(() => summaryFn.value(recentItems30Days.value));
const mostPlayedRecent90Days = computed(() => summaryFn.value(recentItems90Days.value));

const shownListData = computed(() => {
	switch(listType.value) {
		case 'allTime':
			return mostPlayedAllTime.value;
		case 'recent':
			return mostPlayedRecent.value;
		case 'recent30Days':
			return mostPlayedRecent30Days.value;
		case 'recent90Days':
			return mostPlayedRecent90Days.value;
		default:
			console.warn('Unknown list data type. Showing allTime played.');
			return mostPlayedAllTime.value;
	}
})

const groupData = computed(() => shownListData.value.groupedData);

const asPercentage = (value) => value.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:1, maximumFractionDigits: 1});

const baseTableData = computed(() => {
	return groupData.value.reduce((acc, g) => {
		if (Number(g.groupData.difficulty) > 3) return acc;
		if (g.key.startsWith('10x16')) return acc;
		const key = g.key;
		acc[key] = {
			count: g.summary.count,
			time: g.summary.sum,
			favScore: g.summary.favScore
		};
		return acc;
	}, {});
})
const totals = computed(() => {
	let count = 0;
	let time = 0;
	let favScore = 0;
	for (const group of Object.values(baseTableData.value)) {
		time += group.time;
		count += group.count;
		favScore += group.favScore;
	}
	return { count, time, favScore };
})
const sortProp = ref('pCount');
const sortDir = ref('desc');
const setSortProp = (value) => {
	if (sortProp.value === value) {
		sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc';
	} else {
		sortProp.value = value;
		sortDir.value = 'desc';
	}
}
const tablePercentages = computed(() => {
	const result = {};
	const { count: totalCount, time: totalTime, favScore: totalFavScore } = totals.value;
	for (const [key, group] of Object.entries(baseTableData.value)) {
		const count = group.count;
		const time = group.time;
		const favScore = group.favScore;
		const pCount = group.count / totalCount;
		const pTime = group.time / totalTime;
		const pFavScore = favScore / totalFavScore;
		
		const gData = groupData.value.find(val => val.key === key).groupData;
		const numCells = gData.numCells;
		const cells = count * numCells;

		const timePer100Cells = Math.ceil(time / cells * 100);

		result[key] = { numCells, count, time, pCount, pTime, favScore, pFavScore, cells, timePer100Cells };
	}
	let sortBy = sortProp.value;
	if (sortBy === 'size') sortBy = 'numCells';
	return Object.entries(result).sort((a, z) => sortDir.value === 'asc' ? a[1][sortBy] - z[1][sortBy] : z[1][sortBy] - a[1][sortBy]);
})

const tableRows = computed(() => {
	const raw = tablePercentages.value;
	const res = [];
	for (const [key, data] of raw) {
		const { count, pCount, pTime, pFavScore, cells, timePer100Cells } = data;
		const row = [key, count, asPercentage(pCount), asPercentage(pTime), asPercentage(pFavScore), cells, formatTimeMMSS(timePer100Cells)];
		res.push(row);
	}
	return res;
})

watch(baseTableData, (value) => {
	console.log(value);
}, { deep: true, immediate: true })
</script>

<style scoped>
.bleed-grid-2 {
	--basePadding: theme(padding.2);
}
.bleed-grid-4 {
	--basePadding: theme(padding.4);
}
.bleed-grid-6 {
	--basePadding: theme(padding.6);
}
.v-grid-bleed {
	grid-template-columns: 1fr min(calc(100vw - 2 * var(--basePadding, 1rem)), 44rem) 1fr;

}
.v-grid-bleed > * {
	grid-column: 2 / span 1;
}
.v-grid-bleed > .full-bleed {
	grid-column: 1 / -1;
}

.checked {
	@apply bg-teal-600 text-teal-50 font-medium;
}
.checked input:checked {
	@apply bg-teal-900;
}
input[type="radio"]:not(:checked) {
	@apply border-gray-200;
}
input[type="radio"]:focus {
	@apply ring-0 outline-1;
}
</style>