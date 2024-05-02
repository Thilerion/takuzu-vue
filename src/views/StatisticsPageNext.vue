<template>
<div class="flex flex-col">
	<PageHeader
		hide-back
		small
		elevated
		:transparent="false"
		class="mb-4"
	>{{ $t('Statistics.title') }}</PageHeader>

	<div class="stats-content flex-1 pb-3">
		<div
			v-if="!showContent"
			class="stats-no-content bg-white dark:bg-slate-800 mx-6 px-6 py-8 rounded-md shadow-md leading-relaxed"
		>
			<div v-if="noPuzzlesSolved">
				<div>{{ $t('Statistics.none-solved-warning') }}</div>
			</div>
			<div v-else-if="isLoading">{{ $t('Statistics.loading-statistics') }}</div>
			<div v-else>{{ $t('Statistics.fallback-error-msg') }}</div>
		</div>
		<div v-else-if="isInitialized && !noPuzzlesSolved">
			<StatisticsNextContent />
		</div>
		<div v-else>{{ $t('Statistics.fallback-error-msg') }}</div>
	</div>

</div>
</template>

<script setup lang="ts">
import { useStatisticsNextStore } from '@/features/statistics/store.js';
import { storeToRefs } from 'pinia';
import { onBeforeMount } from 'vue';
import { computed } from 'vue';

const statsNextStore = useStatisticsNextStore();
const { isLoading, isInitialized, noPuzzlesSolved } = storeToRefs(statsNextStore);
const showContent = computed(() => isInitialized.value && !isLoading.value && !noPuzzlesSolved.value);

onBeforeMount(() => {
	statsNextStore.initialize();
})
</script>

<style scoped>
.stats-content {
	@apply grid grid-cols-1;
	grid-template-rows: 1fr auto 3fr;
}
.stats-no-content {
	grid-row: 2 / span 1;
}
</style>