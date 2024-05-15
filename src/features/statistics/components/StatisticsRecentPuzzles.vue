<template>
<div>
	<StatisticsBlockHeading>
		<span>{{ $t('Statistics.recently-played') }}</span>
		<template #right>
			<router-link
				class="self-center text-teal-700 dark:text-teal-300 hover-hover:hover:text-teal-500 active:text-teal-500 dark:hover-hover:hover:text-teal-200 dark:active:text-teal-100 flex flex-row items-center"
				:to="{ name: 'StatisticsHistory' }"
			><div class="text-xs font-medium uppercase tracking-wider">{{ $t('Statistics.view-all') }}</div><icon-ic-baseline-chevron-right class="text-xs w-5 h-5" /></router-link>
		</template>
	</StatisticsBlockHeading>

	<div class="bg-white dark:bg-slate-700 rounded shadow-lg shadow-gray-600/10 py-2">
		<ol class="list-grid divide-y divide-gray-100 dark:divide-slate-400">
			<StatisticsRecentPuzzleItem
				v-for="(item) in recentItems"
				:key="item.id"
				class="mx-3 list-item-grid"
				:date="item.date"
				:dimensions="item.dimensions"
				:difficulty="item.difficulty"
				:time="item.timeElapsed"
			/> 
		</ol>
	</div>
</div>	
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useStatisticsNextStore } from '../store.js';
import { ref, computed } from 'vue';

const statsNextStore = useStatisticsNextStore();
const { itemsRecentFirst } = storeToRefs(statsNextStore);

const maxRows = ref(5);
const recentItems = computed(() => itemsRecentFirst.value.slice(0, maxRows.value));

</script>

<style scoped>
.list-grid {
	display: grid;
	grid-template-columns: max-content minmax(max-content, auto) auto auto auto;
	grid-auto-rows: 1fr;
	column-gap: 1ch;
	@apply text-xs;
}
.list-item-grid {
	display: grid;
	grid-template-columns: subgrid;
	grid-column: 1 / -1;
	@apply py-2;
}
</style>