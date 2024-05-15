<template>
<div>
	<transition name="fade" mode="out-in">
		<div
			v-if="shownItems.length > 0"
			:key="listKey"
			class="list divide-y border-y dark:divide-slate-600 dark:border-slate-600 relative"
		>
			<HistoryListPuzzleItem
				v-for="item in shownItems"
				:key="item.id"
				:item="item"
				:record-first="recordData.first.has(item.id!)"
				:record-current="recordData.timeCurrent.has(item.id!)"
				:record-all="recordData.timeAll.has(item.id!)"
			/>
		</div>
		<div
			v-else-if="shownItems.length === 0 && numTotal > 0"
			key="none-filtered"
			class="py-4 text-lg px-8 text-center"
		>
			{{ $t('Statistics.History.none-found-with-filters') }}
		</div>
		<div
			v-else
			key="none"
			class="py-4 text-lg px-8 text-center"
		>
			{{ $t('Statistics.History.none-played-yet') }}
		</div>
	</transition>
</div>
</template>

<script setup lang="ts">
import type { StatsDbExtendedStatisticDataEntry } from '@/services/db/stats-db/models.js';
import type { HistoryListRecordsLists } from '../../composables/history-list-records.js';

defineProps<{
	listKey: string,
	shownItems: StatsDbExtendedStatisticDataEntry[],
	numTotal: number,
	recordData: HistoryListRecordsLists,
}>();
</script>