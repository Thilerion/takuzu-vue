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
				<BaseButton @click="updateSW(true)">Click here to load update</BaseButton>
			</div>
			<div class="debug-opts text-left" v-if="isDebugModeEnabled">
				<h2 class="font-medium mb-1 text-gray-700/90 tracking-wide px-6">Debug menu</h2>
				<div class="debug-list">
					<router-link to="/showcase">Open component showcase</router-link>
					<button @click="disableDebugMode">Disable debug mode</button>
					<button @click="clearPuzzleDb">Clear pregen puzzle db</button>
					<button @click="pregenPuzzles">Pregen puzzles</button>
				</div>
			</div>
			<transition name="gen-result">
				<p class="text-sm text-left mt-4 px-6 font-bold tracking-wider text-gray-600" v-if="clearPuzzlesResult != null">{{clearPuzzlesResult}}</p>
			</transition>
		</div>
	</div>
</template>

<script>
import { useGlobalBuildData } from '@/app.globals.js';
import { clearPuzzleDb } from '@/services/puzzles-db/db.js';
import { useMainStore } from '@/stores/main.js';
import { initPregenWorker } from '@/workers/pregen-puzzles.js';

import { useRegisterSW } from 'virtual:pwa-register/vue';
import { computed, ref, watch, watchEffect } from 'vue';

export default {
	setup() {
		const { pkgVersion, buildDate } = useGlobalBuildData();

		const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

		const clearPuzzlesResult = ref(null);

		let timeout = null;

		watch(clearPuzzlesResult, (cur, prev) => {
			if (cur != null) {
				clearTimeout(timeout);
				timeout = setTimeout(() => {
					clearPuzzlesResult.value = null;
				}, 1000);
			}
		})

		const debugModeClickCounter = ref(0);
		const mainStore = useMainStore();
		const isDebugModeEnabled = computed(() => mainStore.flags.debugMode);
		const enableDebugMode = () => {
			mainStore.setDebugMode(true);
			debugModeClickCounter.value = 0;
		}
		const disableDebugMode = () => {
			mainStore.setDebugMode(false);
			debugModeClickCounter.value = 0;
		}

		return { offlineReady, needRefresh, updateSW: updateServiceWorker, pkgVersion, buildDate, clearPuzzlesResult, debugModeClickCounter, isDebugModeEnabled, enableDebugMode, disableDebugMode };
	},
	data() {
		return {
			appVersion: import.meta.env.PACKAGE_VERSION
		}
	},
	methods: {
		increaseDebugModeClickCounter() {
			this.debugModeClickCounter += 1;
			if (this.debugModeClickCounter >= 5) {
				this.enableDebugMode();
			}
		},
		async clearPuzzleDb() {
			try {
				const result = await clearPuzzleDb();
				console.log(result);
				this.clearPuzzlesResult = 'Successfully cleared puzzle database.';
				return true;
			} catch(e) {
				console.warn(e);
				this.clearPuzzlesResult = 'Error while clearing puzzles...\n' + e;
				return false;
			}
		},
		async pregenPuzzles() {
			try {
				await this.clearPuzzleDb();
				this.clearPuzzlesResult += '\nNow generating puzzles.';
				const result = await initPregenWorker();
				console.log(result);
				this.clearPuzzlesResult = 'Succesfully generated puzzles.';
			} catch(e) {
				console.warn(e);
				this.clearPuzzlesResult = 'Could not pregen puzzles.\n' + e;
			}
		}
	}
};
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