<template>
	<div class="flex flex-col flex-1">
		<PageHeader>Takuzu</PageHeader>
		<div class="flex-1 px-8 text-center space-y-4">
			<button
				@click="increaseDebugModeClickCounter"
				:disabled="isDebugModeEnabled"
				class="block mx-auto"
			>
				<div
					class="text-center p-2 text-sm text-gray-600"
				>App version: {{ pkgVersion }}_<small>{{buildDate}}</small></div>
			</button>
			<div class="p-2">Offline ready: {{offlineReady}}; Need refresh: {{needRefresh}}</div>
			<div class="p-2">
				<BaseButton @click="updateSW(true)">Update now and reload</BaseButton>
			</div>
			<router-link v-if="isDebugModeEnabled" custom to="/showcase" v-slot="{ navigate }">
				<BaseButton @click="navigate">Open component showcase</BaseButton>
			</router-link>
			<BaseButton @click="disableDebugMode" v-if="isDebugModeEnabled">Disable debug mode</BaseButton>
			<BaseButton @click="clearPuzzleDb" v-if="isDebugModeEnabled">Clear pregen puzzle db</BaseButton>
			<BaseButton @click="pregenPuzzles" v-if="isDebugModeEnabled">Pregen puzzles</BaseButton>
			<p v-if="clearPuzzlesResult != null">{{clearPuzzlesResult}}</p>
		</div>
	</div>
</template>

<script>
import { useGlobalBuildData } from '@/app.globals.js';
import { clearPuzzleDb } from '@/services/puzzles-db/db.js';
import { initPregenWorker } from '@/workers/pregen-puzzles.js';

import { useRegisterSW } from 'virtual:pwa-register/vue';
import { watchEffect } from 'vue';

export default {
	setup() {
		const { pkgVersion, buildDate } = useGlobalBuildData();

		const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

		console.log({ needRefresh: needRefresh.value, offlineReady: offlineReady.value});

		watchEffect(() => {
			console.log({ needRefresh: needRefresh.value, offlineReady: offlineReady.value});
		})

		return { offlineReady, needRefresh, updateSW: updateServiceWorker, pkgVersion, buildDate };
	},
	data() {
		return {
			debugModeClickCounter: 0,
			clearPuzzlesResult: null,
			appVersion: import.meta.env.PACKAGE_VERSION
		}
	},
	computed: {
		isDebugModeEnabled() {
			return this.$store.state.debugMode;
		}
	},
	methods: {
		increaseDebugModeClickCounter() {
			this.debugModeClickCounter += 1;
			if (this.debugModeClickCounter >= 5) {
				this.enableDebugMode();
			}
		},
		enableDebugMode() {
			this.$store.dispatch('setDebugMode', true);
			this.debugModeClickCounter = 0;
		},
		disableDebugMode() {
			this.$store.dispatch('setDebugMode', false);
			this.debugModeClickCounter = 0;
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
	
</style>