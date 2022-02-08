<template>
	<div>
		<PageHeader @close="closeSettings">Settings</PageHeader>
		<div class="setting-block">
			<DarkModeSetting />
		</div>

		<div class="setting-block mt-6">
			<h2 class="text-gray-700">Cell theme</h2>
			
			<CellThemeSetting v-model="cellTheme" />
		</div>

		<div class="setting-block mt-6">
			<h2 class="text-gray-700">Input mode</h2>
			
			<div class="mt-2">
				<label class="flex items-center">
					<input type="radio" name="radio-toggle-mode" v-model="toggleMode" value="0">
					<span class="ml-2">Toggle 0 first</span>
				</label>
			</div>
			<div class="mt-2">
				<label class="flex items-center">
					<input type="radio" name="radio-toggle-mode" v-model="toggleMode" value="1">
					<span class="ml-2">Toggle 1 first</span>
				</label>
			</div>
		</div>

		<div class="setting-block mt-6">
			<h2 class="text-gray-700">Assistance</h2>
			<div class="mt-2">
				<label>
					<span>Check button function</span>
				</label>
				<select class="block w-full mt-1" v-model="checkButton">
					<option value="disabled">Disabled</option>
					<option value="ruleViolations">Rule violations</option>
					<option value="incorrectValues">Incorrect values</option>
				</select>
			</div>
		</div>
		<div class="setting-block mt-6">
			<h2 class="text-gray-700">Line side information</h2>
			<div class="mt-2">
				<select class="block w-full mt-1" v-model="showLineInfo">
					<option
						v-for="opt in lineInfoOptions"
						:value="opt.value"
						:key="opt.value"
					>{{opt.label}}</option>
				</select>
			</div>
		</div>
		<div class="setting-block mt-6">
			<h2 class="text-gray-700">Other</h2>
			<label class="flex items-center mt-4">
				<input type="checkbox" v-model="enableVibration">
				<span class="ml-2">Enable vibration</span>
			</label>
			<div class="setting-block mt-4">
				<div>Vibration strength</div>
				<div class="mt-2">
					<label class="flex items-center">
						<input type="radio" name="radio-vib-strength" v-model="vibrationStrength" value="15">
						<span class="ml-2">Low</span>
					</label>
				</div>
				<div class="mt-2">
					<label class="flex items-center">
						<input type="radio" name="radio-vib-strength" v-model="vibrationStrength" value="25">
						<span class="ml-2">Medium</span>
					</label>
				</div>
				<div class="mt-2">
					<label class="flex items-center">
						<input type="radio" name="radio-vib-strength" v-model="vibrationStrength" value="40">
						<span class="ml-2">High</span>
					</label>
				</div>
				<div>
					<BaseButton @click="vibrate">Tap to test</BaseButton>
				</div>
			</div>
			<label class="flex items-center mt-4">
				<input type="checkbox" v-model="enableWakeLock">
				<span class="ml-2">Keep screen active while playing</span>
			</label>
			<label class="flex items-center mt-4">
				<input type="checkbox" v-model="showTimer">
				<span class="ml-2">Show timer</span>
			</label>
		</div>
	</div>
</template>

<script>
import CellThemeSetting from '@/components/settings/CellThemeSetting.vue';
import DarkModeSetting from '../components/settings/DarkModeSetting.vue';
import BaseButton from '@/components/global/BaseButton.vue';
import { useTapVibrate } from '@/composables/use-tap-vibrate.js';
import { toRef } from 'vue';
import { useSettingsStore } from '@/stores/settings.js';
import { storeToRefs } from 'pinia';

export default {
	components: {
		DarkModeSetting,
		CellThemeSetting,
		BaseButton
	},
	setup() {
		const settingsStore = useSettingsStore();
		const pattern = toRef(settingsStore, 'vibrationStrength');
		const { vibrate } = useTapVibrate({
			pattern,
			delay: null,
			enable: true
		})

		const {
			cellTheme,
			toggleMode,
			showLineInfo,
			enableWakeLock,
			enableVibration,
			vibrationStrength,
			showTimer,
			checkButton
		} = storeToRefs(settingsStore);

		return { vibrate, cellTheme, toggleMode, showLineInfo, enableWakeLock, enableVibration, vibrationStrength, showTimer, checkButton };
	},
	data() {
		return {
			lineInfoOptions: [
				{ label: 'Disabled', value: ''},
				{ label: 'Line coordinates', value: 'coords'},
				{ label: 'Remaining values in line', value: 'remainingCount'},
				{ label: 'Current values in line', value: 'currentCount'},
			],			
		}
	},
	methods: {
		closeSettings() {
			const prev = this.$route.meta.prev;
			if (this.$route.name === 'PlayPuzzle.settings') {
				if (prev == null || (prev && prev.name !== 'PlayPuzzle')) this.$router.replace({ name: 'PlayPuzzle' });
				else this.$router.go(-1);
			} else {
				if (prev) this.$router.go(-1);
				else this.$router.replace({ name: 'MainMenu' });
			}
		}
	}
};
</script>

<style scoped>
.setting-block {
	@apply block text-gray-900 text-left px-8;
}
</style>