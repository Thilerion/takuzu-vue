<template>
<div>
	<WarningMsg v-if="!isSupported">{{ $t('Settings.vibration.unsupported') }}</WarningMsg>
	<InputToggle
		id="vibrationEnabled"
		v-model="enableVibrationToggleValue"
		small
	>
		<span class="setting-subheading">{{ $t('Settings.vibration.vibrate-when-toggling-cells') }}</span>
	</InputToggle>
	<div class="mt-3" :class="{'disabled': !enableVibration}">
		<label
			for="vibrationStrength"
			class="mb-1 setting-subheading"
		>{{ $t('Settings.vibration.vibration-strength') }} <span class="text-xs text-gray-500 dark:text-slate-300">{{ vibrationStrengthPercentage }}</span></label>
		<div class="flex gap-2">
			<InputRange
				id="vibrationStrength"
				min="0"
				:max="sliderMax"
				:step="1"
				:model-value="vibrationStrengthIdx"
				class="w-full flex-1"
				@update:model-value="setVibrationStrength"
			/>
			<BaseButton class="flex-0 w-14 text-sm !py-1 !px-0 !font-normal" @click="vibrate">{{ $t('test') }}</BaseButton>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { useTapVibrate } from '@/composables/use-tap-vibrate';
import { useSettingsStore } from '@/stores/settings/store';
import { validVibrationStrengths } from '@/stores/settings/options';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const settingsStore = useSettingsStore();
const { enableVibration, vibrationStrength } = storeToRefs(settingsStore);
const { vibrate, isSupported } = useTapVibrate({
	pattern: vibrationStrength,
	delay: 0,
	enable: true
})
const sliderMax = validVibrationStrengths.length - 1;

const vibrationStrengthIdx = computed(() => {
	return validVibrationStrengths.indexOf(vibrationStrength.value);
})
const setVibrationStrength = (val: string | number) => {
	const idx = typeof val === 'number' ? val : parseInt(val);
	const duration = validVibrationStrengths[idx];
	vibrationStrength.value = duration;

	enableVibration.value = duration > 0;

	setTimeout(() => {
		vibrate();
	}, 0);
}

const vibrationStrengthPercentage = computed(() => {
	return `${vibrationStrengthIdx.value / 5 * 100}%`;
})

const enableVibrationToggleValue = computed({
	get: () => enableVibration.value,
	set: (val: boolean) => {
		// if vibration is enabled through the toggle, but strength is set to 0, set strength to lowest possible enabled value
		if (val && vibrationStrengthIdx.value === 0) {
			vibrationStrength.value = validVibrationStrengths[1];
		}
		enableVibration.value = val;
	}
});

</script>

<style scoped>
.disabled {
	opacity: 0.5;
}
</style>