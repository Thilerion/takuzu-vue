<template>
	<div class="mb-4 gap-y-4 grid v-grid-bleed bleed-grid-4">
		<div class="text-sm">
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
				@sort-header="(key: string) => setSortProp(key as keyof TableGroupData | 'size')"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useStatisticsStore } from '@/stores/statistics';
import { computed, onBeforeMount, ref } from 'vue';
import { formatTimeMMSSWithRounding } from '@/utils/time.utils';
import { useStorage } from '@vueuse/core';
import BaseTable from '@/components/global/table/BaseTable.vue'
import { getMostPlayedPuzzleConfigs, getMostPlayedPuzzleSizes } from '@/services/stats/most-played.js';
import type { StatsDbExtendedStatisticDataEntry } from '@/services/db/stats-db/models.js';
import { itemsSolvedSinceDaysAgo } from '@/services/stats/dates.js';
const formatTime = formatTimeMMSSWithRounding(200);

const statsStore = useStatisticsStore();
onBeforeMount(() => {
	if (statsStore.initialized || statsStore.isLoading) return;
	statsStore.initialize();
})

type MostPlayedListType = 'allTime' | 'recent30Days' | 'recent90Days';
type MostPlayedItemType = 'size' | 'puzzleConfig';
const listType = useStorage<MostPlayedListType>('takuzu_most-played-list-type', 'recent30Days', sessionStorage);
const itemType = useStorage<MostPlayedItemType>('takuzu_most-played-item-type', 'puzzleConfig', sessionStorage);

const mergeDifficulties = computed(() => {
	return itemType.value === 'size';
})

const itemsSolvedInDateRange = computed(() => {
	switch(listType.value) {
		case 'allTime':
			return statsStore.sortedByDate;
		case 'recent30Days': {
			return itemsSolvedSinceDaysAgo(
				statsStore.sortedByDate,
				30,
				{ isSorted: true }
			);
		}			
		case 'recent90Days': {
			return itemsSolvedSinceDaysAgo(
				statsStore.sortedByDate,
				90,
				{ isSorted: true }
			);
		}			
		default: {
			const x: never = listType.value;
			console.warn(`Unknown list data type (${x}). Showing none.`);
			return [];
		}
	}
})

const summarizeByDimensions = (items: StatsDbExtendedStatisticDataEntry[]) => {
	return getMostPlayedPuzzleSizes(items);
}
const summarizeByConfigs = (items: StatsDbExtendedStatisticDataEntry[]) => {
	return getMostPlayedPuzzleConfigs(items);
}

const shownListData = computed(() => {
	const summarizeFn = itemType.value === 'size' ? summarizeByDimensions : summarizeByConfigs;
	return summarizeFn(itemsSolvedInDateRange.value);
})

const groupData = computed(() => shownListData.value.groupedData);

const asPercentage = (value: number) => value.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:1, maximumFractionDigits: 1});

type BaseTableData = {
	count: number,
	time: number,
	favScore: number
}
type BaseTableDataAcc = Record<string, BaseTableData>;

const baseTableData = computed(() => {
	return groupData.value.reduce((acc, g) => {
		if ('difficulty' in g.groupData && Number(g.groupData.difficulty) > 3) return acc; // TODO: incorrect type, does not know difficulty can be found in groupData
		if (g.key.startsWith('10x16')) return acc;
		const key = g.key;
		acc[key] = {
			count: g.summary.count,
			time: g.summary.sum,
			favScore: g.summary.favScore
		};
		return acc;
	}, {} as BaseTableDataAcc);
})
const totals = computed((): BaseTableData => {
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
const sortProp = ref<keyof TableGroupData | 'size'>('pCount');
const sortDir = ref('desc');
const setSortProp = (value: keyof TableGroupData | 'size') => {
	if (sortProp.value === value) {
		sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc';
	} else {
		sortProp.value = value;
		sortDir.value = 'desc';
	}
}

type TableGroupData = { numCells: number;
	count: number;
	time: number;
	pCount: number;
	pTime: number;
	favScore: number;
	pFavScore: number;
	cells: number;
	timePer100Cells: number;
};

const tablePercentages = computed(() => {
	const result: Record<string, TableGroupData> = {};
	const { count: totalCount, time: totalTime, favScore: totalFavScore } = totals.value;
	for (const [key, group] of Object.entries(baseTableData.value)) {
		const count = group.count;
		const time = group.time;
		const favScore = group.favScore;
		const pCount = group.count / totalCount;
		const pTime = group.time / totalTime;
		const pFavScore = favScore / totalFavScore;
		
		const gData = groupData.value.find(val => val.key === key)!.groupData;
		const numCells = gData.numCells;
		const cells = count * numCells;

		const timePer100Cells = Math.ceil(time / cells * 100);

		result[key] = { numCells, count, time, pCount, pTime, favScore, pFavScore, cells, timePer100Cells };
	}
	const sortBy = sortProp.value === 'size' ? 'numCells' : sortProp.value as keyof TableGroupData;
	const res: [groupKey: string, data: TableGroupData][] = Object.entries(result).sort((a, z) => sortDir.value === 'asc' ? (a[1][sortBy] - z[1][sortBy]) : z[1][sortBy] - a[1][sortBy]);
	return res;
})

const tableRows = computed(() => {
	const raw = tablePercentages.value;
	const res = [];
	for (const [key, data] of raw) {
		const { count, pCount, pTime, pFavScore, cells, timePer100Cells } = data;
		const row = [key, count, asPercentage(pCount as number), asPercentage(pTime as number), asPercentage(pFavScore as number), cells, formatTime(timePer100Cells as number)];
		res.push(row);
	}
	return res;
})
</script>

<style scoped>
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