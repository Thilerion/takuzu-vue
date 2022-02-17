<template>
	<div>
		<h2 class="setting-heading">Vibration</h2>
		<WarningMsg v-if="!isSupported">Your device does not support vibration for this app.</WarningMsg>
		<InputToggle v-model="enableVibration" id="vibrationEnabled">
			<span class="setting-subheading">Vibrate when toggling cells</span>
		</InputToggle>
		<div class="mt-3" :class="{'disabled': !enableVibration}">
			<label for="vibrationStrength" class="mb-1">Vibration strength <small>{{vibrationStrengthPercentage}}</small></label>
			<div class="flex gap-2">
				<InputRange
					:min="0"
					:max="5"
					:step="1"
					id="vibrationStrength"
					v-model="vibrationStrengthModel"
					class="w-full flex-1"
				/>
				<BaseButton @click="vibrate" class="flex-0 w-20">Test</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useTapVibrate } from '@/composables/use-tap-vibrate.js';
import { useSettingsStore } from '@/stores/settings.js';
import { storeToRefs } from 'pinia';
import { computed, ref, toRef } from 'vue';
import InputToggle from '../global/input/InputToggle2.vue';
import InputRange from '../global/input/InputRange.vue';
import WarningMsg from '../global/WarningMsg.vue';

const inputDurationMap = new Map([
	['0', 0],
	['1', 18],
	['2', 32],
	['3', 45],
	['4', 60],
	['5', 76],
])
const durationInputValueMap = new Map([...inputDurationMap].map(val => val.reverse()));

const settingsStore = useSettingsStore();
const pattern = toRef(settingsStore, 'vibrationStrength');
const { vibrate, isSupported } = useTapVibrate({
	pattern,
	delay: null,
	enable: true
})
const { enableVibration, vibrationStrength } = storeToRefs(settingsStore);


const vStrengthValue = vibrationStrength.value;
const vStrengthAsInput = durationInputValueMap.get(vStrengthValue);
console.log({vStrengthValue, vStrengthAsInput });
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
	setTimeout(() => {
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