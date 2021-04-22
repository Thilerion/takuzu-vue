<template>
	<div>
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