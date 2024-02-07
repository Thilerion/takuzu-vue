<template>
	<div
		class="how-to-play flex flex-col pb-4"
		ref="pageEl"
	>
		<PageHeader class="flex-shrink-0 relative z-10" :elevated="false">How to play</PageHeader>
		<div>
			<HowToPlayTabsList
				class="shadow-sm"
				:tab-labels="tabLabels"
				:selected-tab="selectedTabIdx"
				@update:selected-tab="(val) => selectedTabIdx = val"
			/>
			<div
				class="bg-white rounded-t-lg relative z-0 shadow-sm mb-6"
			>
				<component class="px-8 py-4" :is="selectedComponent" />
			</div>
		</div>
		<ScrollToTop :el="pageEl" />
	</div>
</template>

<script setup lang="ts">
import { initGlobalCellThemeProvider } from '@/components/gameboard/composables/useCellThemeProvider.js';
import { computed, defineAsyncComponent } from 'vue';
import { ref } from 'vue';

const pageEl = ref<HTMLElement | null>(null);

initGlobalCellThemeProvider();

const tabs = [
	{
		label: 'Overview & Rules',
		component: defineAsyncComponent(() => import('@/components/how-to-play/HowToPlayOverview.vue'))
	},
	{
		label: 'Basic Techniques',
		component: defineAsyncComponent(() => import('@/components/how-to-play/BasicTechniques.vue'))
	}
]
const tabLabels = tabs.map(t => t.label);

const selectedTabIdx = ref(0);
const selectedComponent = computed(() => tabs[selectedTabIdx.value].component);
</script>

<style scoped>
.how-to-play {
	@apply overflow-x-hidden fixed inset-0 overscroll-y-auto;
}
</style>