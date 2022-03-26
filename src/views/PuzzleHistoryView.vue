<template>
	<div class="flex flex-col overflow-y-auto">
		<PageHeader>Puzzle history</PageHeader>
		<div class="content flex-1">
			<div class="list divide-y border-y">
				<HistoryListItem
					v-for="item in shownItems"
					:key="item.id"
					v-bind="item"
				></HistoryListItem>
			</div>
		</div>
	</div>
</template>

<script>

const sortDateNewest = (a, b) => {
	if (a < b) return -1;
	else if (a > b) return 1;
	return 0;
}
const sortDateOldest = (a, b) => {
	return sortDateNewest(b, a);
}

</script>

<script setup>
import PageHeader from '../components/global/base-layout/PageHeader.vue';
import { useStatisticsStore2 } from '@/stores/statistics2.js';
import { storeToRefs } from 'pinia';
import { ref, computed, watchEffect, watch, onBeforeMount } from 'vue';
import HistoryListItem from '@/components/statistics2/HistoryListItem.vue';

const statsStore = useStatisticsStore2();

onBeforeMount(() => {
	statsStore.initialize({ forceUpdate: true })
})
const { historyItems } = storeToRefs(statsStore);

const clonedItems = ref([...historyItems.value]);

const sortBy = ref({
	key: 'date',
	type: 'newest'
});
const sortFn = computed(() => {
	if (sortBy.value.key === 'date') {
		if (sortBy.value.type === 'newest') return sortDateNewest;
		else if (sortBy.value.type === 'oldest') return sortDateOldest;
	}
})

watchEffect(() => {
	clonedItems.value = clonedItems.value.sort(sortFn.value);
})
watch(historyItems, (value) => {
	clonedItems.value = [...value];
})

const page = ref(0);
const perPage = ref(10);

const shownItems = computed(() => {
	const idx = page.value * perPage.value;
	return clonedItems.value.slice(idx, idx + perPage.value);
})
</script>

<style scoped>

</style>