<template>
	<div class="flex flex-col overflow-y-auto">
		<PageHeader>Puzzle history</PageHeader>
		<div class="content flex-1">
			<div class="flex flex-row items-center gap-3 text-sm">
				<div>Per page: </div><select v-model.number="perPage" class="form-select text-black rounded border border-gray-400 py-1 pr-5 pl-1 text-sm">
				<option :value="10">10</option>
				<option :value="20">20</option>
				<option :value="50">50</option>
				<option :value="100">100</option>
			</select>
			</div>
			<div class="flex flex-row">
				<button @click="sortBy = 'newest'">Newest</button>
				<button @click="sortBy = 'oldest'">Oldest</button>
				<label>Only favorites <input type="checkbox" v-model="filters.onlyFavorites"></label>
			</div>
			<div ref="anchorEl"></div>
			<BasePagination v-model="page" :length="filteredItems.length" :page-size="perPage" />
				<div class="list divide-y border-y relative">
					<transition-group name="list-change">
					<HistoryListItem
						v-for="item in shownItems"
						:key="item.id"
						v-bind="item"
						@favorite="(val) => markFavorite(item.id, val)"
					></HistoryListItem>
					</transition-group>
				</div>
		</div>
		<BasePagination v-model="page" :length="filteredItems.length" :page-size="perPage" />
	</div>
</template>

<script>

const sortDateNewest = (a, b) => {
	if (a.date < b.date) return 1;
	else if (a.date > b.date) return -1;
	return 0;
}
const sortDateOldest = (a, b) => {
	return sortDateNewest(b, a);
}

const sortFns = {
	newest: sortDateNewest,
	oldest: sortDateOldest
}

function sortItems(items, sortBy = 'newest') {
	const fn = sortFns[sortBy];
	items.sort(fn);
	return items;
}

</script>

<script setup>
import PageHeader from '../components/global/base-layout/PageHeader.vue';
import { useStatisticsStore2 } from '@/stores/statistics2.js';
import { storeToRefs } from 'pinia';
import { ref, computed, watchEffect, watch, onBeforeMount, reactive } from 'vue';
import HistoryListItem from '@/components/statistics2/HistoryListItem.vue';
import BasePagination from '@/components/global/BasePagination.vue';
import { useRoute, useRouter } from 'vue-router';

const statsStore = useStatisticsStore2();

onBeforeMount(() => {
	statsStore.initialize({ forceUpdate: true })
})
const { historyItems } = storeToRefs(statsStore);

const clonedItems = ref([...historyItems.value]);


const sortBy = ref('newest');

const filters = reactive({
	onlyFavorites: false
})

watch([historyItems, sortBy], ([value, sortBy]) => {
	clonedItems.value = sortItems(value, sortBy);
})

const page = ref(0);
const perPage = ref(10);

const router = useRouter();
const route = useRoute();

onBeforeMount(() => {
	const { query } = route;
	console.log({ query});
	if (query.page) {
		page.value = Number(query.page);
	}
	if (query.perPage) {
		perPage.value = Number(query.perPage);
	}
	if (query.sortBy) {
		sortBy.value = query.sortBy;
	}
})

watchEffect(() => {
	const query = {
		...route.query,
		page: page.value,
		perPage: perPage.value,
		sortBy: sortBy.value
	};
	const name = route.name;
	router.replace({
		name,
		query
	});
})

const anchorEl = ref(null);
watch(page, () => {
	if (anchorEl.value != null) {
		anchorEl.value.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest'
		})
	}
})
const filteredItems = computed(() => {
	return clonedItems.value.filter(item => {
		if (filters.onlyFavorites) {
			const isFav = !!(item?.flags?.favorite);
			if (!isFav) return false;
		}
		return true;
	})
})

watch(filters, () => {
	page.value = 0;
}, { deep: true });

const shownItems = computed(() => {
	const idx = page.value * perPage.value;
	return filteredItems.value.slice(idx, idx + perPage.value);
})

const markFavorite = async (id, value) => {
	statsStore.markFavorite(id, value);
}
</script>

<style scoped>
.list-change-leave-active {
	transition: opacity 0.3s ease;
}

.list-change-enter-active {
	transition: opacity 0.15s ease 0.25s;
}

.list-change-enter-from, .list-change-leave-to {
	opacity: 0;
}
</style>