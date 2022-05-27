<template>
	<div>
		<PageHeader
			@close="closeSettings"
			small
			:elevated="true"
			:transparent="false"
			:hide-back="hideBack"
		>Settings</PageHeader>
		<div class="setting-block mt-4">
			<DarkModeSetting />
		</div>

		<div class="setting-block mt-6">
			<h2 class="setting-heading">Cell theme</h2>
			
			<CellThemeSetting v-model="cellTheme" />
		</div>

		<div class="setting-block mt-6">
			<h2 class="setting-heading">Input mode</h2>
			
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
			<h2 class="setting-heading">Assistance</h2>
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
			<h2 class="setting-heading">Puzzle board ruler</h2>
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
		<VibrationSetting
			class="setting-block mt-6"
		/>
		<div class="setting-block mt-6">
			<h2 class="setting-heading">Other</h2>
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
import VibrationSetting from '@/components/settings/VibrationSetting.vue';

export default {
	components: {
		DarkModeSetting,
		CellThemeSetting,
		BaseButton,
		VibrationSetting,
	},
	props: {
		hideBack: Boolean
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
				else this.$router.replace({ name: 'Home' });
			}
		}
	}
};
</script>

<style>
.setting-block {
	@apply block text-gray-900 text-left px-8;
}

.setting-heading {
	@apply text-gray-700 dark:text-gray-200;
}
.setting-subheading, .setting-block label > span {
	@apply text-gray-600 dark:text-gray-300;
}

.setting-block select {
}
</style>