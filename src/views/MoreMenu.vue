<template>
	<div class="flex flex-col flex-1">
		<PageHeader
			small
			:elevated="true"
			:transparent="false"
		>Takuzu</PageHeader>
		<div class="flex-1 text-center flex flex-col">
			<button
				v-if="needRefresh"
				@click="updateServiceWorker(true)"
				class="flex flex-col items-center text-center px-2 py-4 text-sm mx-auto"
			>
				<span>An update is available!</span>
				<span>Click here to install it (this will only take a second).</span>
			</button>
			<transition-group name="t-fade">
			<div class="text-left first-of-type:mt-4" v-if="showToolsMenu">
				<BasicListHeader class="">Tools</BasicListHeader>
				<BasicLinkList class="divide-y divide-gray-150 bg-white px-4 rounded-xl shadow-lg">
					<BasicLinkListItem v-if="customPuzzleToolEnabled"><router-link to="/custom-create">Create/import custom puzzle</router-link></BasicLinkListItem>
					<BasicLinkListItem v-if="analysisToolEnabled"><router-link to="/analysis">Puzzle analysis and solver</router-link></BasicLinkListItem>
				</BasicLinkList>
			</div>
			
			<template
				v-if="isDebugModeEnabled"
			>
				<DebugMenu
					class="mt-6"
					@disable-debug-mode="toggleDebugMode(false)"
				/>
				<DebugFeatureTogglesList
					class="mt-6"
				/>
			</template>
			</transition-group>
		</div>
		<button
			@click="toggleDebugMode(true, { immediate: false })"
			:disabled="isDebugModeEnabled"
			class="block mx-auto max-w-xs py-2 px-2 mt-4"
		>
			<div
				class="text-center p-2 text-sm text-gray-600"
			>
				App version: {{ pkgVersion }}_<small>{{buildDate}}</small>
			</div>
		</button>
	</div>
</template>

<script setup>
import { useGlobalBuildData } from '@/app.globals.js';
import { useMainStore } from '@/stores/main.js';

import { useRegisterSW } from 'virtual:pwa-register/vue';
import { computed, defineAsyncComponent, toRefs } from 'vue';
import BasicLinkList from '@/components/global/list/BasicLinkList.vue';
import { useDebugMode } from '@/stores/composables/useDebugMode';

const { pkgVersion, buildDate } = useGlobalBuildData();

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

const { toggleDebugMode, enabled: isDebugModeEnabled } = useDebugMode();

const mainStore = useMainStore();
const customPuzzleToolEnabled = computed(() => mainStore.featureToggles.customPuzzleTool.isEnabled);
const analysisToolEnabled = computed(() => mainStore.featureToggles.analysisTool.isEnabled);
const showToolsMenu = computed(() => {
	return customPuzzleToolEnabled.value || analysisToolEnabled.value;
})

const DebugMenu = defineAsyncComponent(() => import('@/components/debug-menu/DebugMenu.vue'));
const DebugFeatureTogglesList = defineAsyncComponent(() => import('@/components/debug-menu/DebugFeatureToggles.vue'));
</script>

<style scoped>
.debug-list {
	@apply divide-y divide-gray-150 bg-white px-4 rounded-xl;
	box-shadow: rgba(100, 100, 111, 0.15) 0px 2px 12px 0px;
}
.debug-list > * {
	@apply w-full flex items-center justify-start text-left min-h-[28px] px-2 py-4 bg-white;
}

.gen-result-enter-active {
	transition: opacity .1s ease;
}
.gen-result-leave-active {
	transition: opacity 1s ease 2s;
}

.gen-result-enter-from, .gen-result-leave-to {
	opacity: 0;
}

.t-fade-enter-active, .t-fade-leave-active {
	@apply transition-opacity duration-300 delay-100;
}
.t-fade-enter-from, .t-fade-leave-to {
	@apply opacity-0;
}
</style>