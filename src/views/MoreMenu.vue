<template>
	<div class="flex flex-col flex-1">
		<PageHeader>Takuzu</PageHeader>
		<div class="flex-1 text-center space-y-4">
			<button
				@click="increaseDebugModeClickCounter"
				:disabled="isDebugModeEnabled"
				class="block mx-auto max-w-xs"
			>
				<div
					class="text-center p-2 text-sm text-gray-600"
				>
					App version: {{ pkgVersion }}_<small>{{buildDate}}</small>
				</div>
			</button>
			<div class="text-center pt-2 text-sm text-gray-600" v-if="needRefresh">
				<p class="my-2">Update ready. Refresh to load update.</p>
				<BaseButton @click="updateServiceWorker(true)">Click here to load update</BaseButton>
			</div>
			<router-link to="/puzzle-input">Puzzle Input</router-link>
			<DebugMenu
				v-if="isDebugModeEnabled"
				@reset-debug-counter="debugModeClickCounter = 0"
			/>
		</div>
	</div>
</template>

<script setup>
import { useGlobalBuildData } from '@/app.globals.js';
import { useMainStore } from '@/stores/main.js';

import { useRegisterSW } from 'virtual:pwa-register/vue';
import { computed, ref, defineAsyncComponent } from 'vue';

const { pkgVersion, buildDate } = useGlobalBuildData();

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

const debugModeClickCounter = ref(0);
const mainStore = useMainStore();
const isDebugModeEnabled = computed(() => mainStore.flags.debugMode);
const enableDebugMode = () => {
	mainStore.setDebugMode(true);
	debugModeClickCounter.value = 0;
}

const DebugMenu = defineAsyncComponent(() => import('@/components/debug-menu/DebugMenu.vue'));

function increaseDebugModeClickCounter() {
	debugModeClickCounter.value += 1;
	if (debugModeClickCounter.value >= 5) {
		enableDebugMode();
	}
}
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
</style>