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
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			devModeClickCounter: 0,
		}
	},
	computed: {
		appVersion() {
			return process.env.VUE_APP_VERSION;
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
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>