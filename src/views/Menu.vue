<template>
	<div class="flex flex-col flex-1">
		<PageHeader>Takuzu</PageHeader>
		<div class="flex-1 px-8 text-center space-y-4">
			<button
				@click="increaseDevModeClickCounter"
				:disabled="isDevModeEnabled"
				class="block mx-auto"
			>
				<div
					class="text-center p-2 text-sm text-gray-600"
				>App version: {{ appVersion }}</div>
			</button>
			<router-link v-if="isDevModeEnabled" custom to="/showcase" v-slot="{ navigate }">
				<BaseButton @click="navigate">Open component showcase</BaseButton>
			</router-link>
			<BaseButton @click="disableDevMode" v-if="isDevModeEnabled">Disable dev mode</BaseButton>
			<BaseButton @click="clearPuzzleDb" v-if="isDevModeEnabled">Clear pregen puzzle db</BaseButton>
			<BaseButton @click="pregenPuzzles" v-if="isDevModeEnabled">Pregen puzzles</BaseButton>
			<p v-if="clearPuzzlesResult != null">{{clearPuzzlesResult}}</p>
		</div>
	</div>
</template>

<script>
import { clearPuzzleDb } from '@/services/puzzles-db/db.js';
import { initPregenWorker } from '@/workers/pregen-puzzles.js';

export default {
	data() {
		return {
			devModeClickCounter: 0,
			clearPuzzlesResult: null,
		}
	},
	computed: {
		appVersion() {
			return "TODO";
		},
		isDevModeEnabled() {
			return this.$store.state.devMode;
		}
	},
	methods: {
		increaseDevModeClickCounter() {
			this.devModeClickCounter += 1;
			if (this.devModeClickCounter >= 5) {
				this.enableDevMode();
			}
		},
		enableDevMode() {
			this.$store.commit('setDevMode', true);
			this.devModeClickCounter = 0;
		},
		disableDevMode() {
			this.$store.commit('setDevMode', false);
			this.devModeClickCounter = 0;
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