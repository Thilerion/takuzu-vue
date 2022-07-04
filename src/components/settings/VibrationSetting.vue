<template>
	<div>
		<WarningMsg v-if="!isSupported">Your device does not support vibration for this app.</WarningMsg>
		<InputToggle2 small v-model="enableVibration" id="vibrationEnabled">
			<span class="setting-subheading">Vibrate when toggling cells</span>
		</InputToggle2>
		<div class="mt-3" :class="{'disabled': !enableVibration}">
			<label for="vibrationStrength" class="mb-1 setting-subheading">Vibration strength <span class="text-xs text-gray-500 dark:text-slate-300">{{vibrationStrengthPercentage}}</span></label>
			<div class="flex gap-2">
				<InputRange2
					:min="0"
					:max="vibrationOptsLength - 1"
					:step="1"
					id="vibrationStrength"
					v-model="vibrationStrengthModel"
					class="w-full flex-1"
				/>
				<BaseButton @click="vibrate" class="flex-0 w-14 text-sm !py-1 !px-0 !font-normal">Test</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useTapVibrate } from '@/composables/use-tap-vibrate.js';
import { useSettingsStore } from '@/stores/settings/store';
import { validVibrationStrengths } from '@/stores/settings/options';
import { storeToRefs } from 'pinia';
import { computed, ref, toRef } from 'vue';



const vibrationOptsLength = validVibrationStrengths.length;
const inputDurationMap = new Map(
	validVibrationStrengths.map((val, idx) => {
		return [String(idx), val];
	})
)

const durationInputValueMap = new Map([...inputDurationMap].map(val => val.reverse()));

const settingsStore = useSettingsStore();
const pattern = toRef(settingsStore, 'vibrationStrength');
const { vibrate, isSupported } = useTapVibrate({
	pattern,
	delay: null,
	enable: true
})
const { enableVibration, vibrationStrength } = storeToRefs(settingsStore);


const vibrationSliderValue = ref(durationInputValueMap.get(vibrationStrength.value) ?? 0);

const vibrationStrengthPercentage = computed(() => {
	const inputValue = (vibrationSliderValue.value * 1);
	return `${inputValue / 5 * 100}%`;
})

const setVibrationStrength = (value) => {
	vibrationSliderValue.value = value;

	const duration = inputDurationMap.get(value) ?? 0;

	if (duration <= 0) {
		enableVibration.value = false;
	} else {
		enableVibration.value = true;
	}

	vibrationStrength.value = duration;
	window.setTimeout(() => {
		vibrate();
	}, 0);
}

const vibrationStrengthModel = computed({
	get() {
		return vibrationSliderValue.value;
	},
	set(value) {
		setVibrationStrength(value);
	}
})
</script>

<style scoped>
.disabled {
	opacity: 0.5;
}
</style>