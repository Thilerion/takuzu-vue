<template>
	<div>
		<h2 class="text-gray-700">Other</h2>
		<div class="mt-2">
			<label class="flex flex-col justify-center">
				<span class="">Vibration intensity</span>
				<div class="flex items-center">
					<input
						class="w-48 mr-4"
						type="range"
						v-model.number="vibrationIntensity"
						min="0"
						max="3"
						step="1"
					>
					<span>{{ vibrationIntensityLabel }}</span>
				</div>
			</label>
		</div>
		<div class="pl-6" :class="{ disabled: !vibrationEnabled }">
			<div class="mt-2">
				<label class="flex items-center">
					<input type="checkbox" :disabled="!vibrationEnabled" v-model="vibrateUI">
					<span class="ml-2">UI Vibration (buttons)</span>
				</label>
			</div>
			<div class="mt-2">
				<label class="flex items-center">
					<input type="checkbox" :disabled="!vibrationEnabled" v-model="vibrateGame">
					<span class="ml-2">Game vibration</span>
				</label>
			</div>
			<div class="mt-2">
				<label class="flex items-center">
					<input type="checkbox" :disabled="!vibrationEnabled" v-model="vibrateInfo">
					<span class="ml-2">Info vibration</span>
				</label>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		settings: {
			type: Object,
			required: true
		}
	},
	computed: {
		vibrationIntensity: {
			get() {
				return this.settings.vibrationIntensity;
			},
			set(value) {
				this.$emit('update-setting', 'vibrationIntensity', Number(value));
			}
		},
		vibrateUI: {
			get() {
				return this.settings.vibrateUI;
			},
			set(value) {
				this.$emit('update-setting', 'vibrateUI', value);
			}
		},
		vibrateGame: {
			get() {
				return this.settings.vibrateGame;
			},
			set(value) {
				this.$emit('update-setting', 'vibrateGame', value);
			}
		},
		vibrateInfo: {
			get() {
				return this.settings.vibrateInfo;
			},
			set(value) {
				this.$emit('update-setting', 'vibrateInfo', value);
			}
		},


		vibrationEnabled() {
			return this.vibrationIntensity > 0;
		},
		vibrationIntensityLabel() {
			return ['Off', 'Low', 'Medium', 'High'][this.vibrationIntensity];
		},
	}
};
</script>

<style lang="postcss" scoped>
.disabled {
	@apply text-gray-500;
}
input:checked:disabled {
	@apply bg-gray-500;
}
</style>