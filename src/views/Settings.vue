<template>
	<div>
		<PageHeader>Settings</PageHeader>
		<div class="setting-block">
			<DarkModeSetting />
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
					<span>Automatic Validation</span>
					<select class="block w-full mt-1" v-model="automaticValidation">
						<option value="disabled">Disabled</option>
						<option value="ruleViolations">Rule violations</option>
						<option value="incorrectValues">Incorrect values</option>
					</select>
				</label>
			</div>
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
			<VibrationSetting @update-setting="updateSetting" :settings="settings" />
			<label class="flex items-center mt-4">
				<input type="checkbox" v-model="enableWakeLock">
				<span class="ml-2">Enable wake lock</span>
			</label>
		</div>
	</div>
</template>

<script>
import DarkModeSetting from '../components/settings/DarkModeSetting';
import VibrationSetting from '../components/settings/VibrationSetting';

export default {
	components: {
		DarkModeSetting,
		VibrationSetting,
	},
	data() {
		return {
			lineInfoOptions: [
				{ label: 'Disabled', value: ''},
				{ label: 'Line coordinates', value: 'coords'},
				{ label: 'Remaining values in line', value: 'remainingCount'},
				{ label: 'Current values in line', value: 'currentCount'},
			]
		}
	},
	computed: {
		settings() {
			return this.$store.state.settings;
		},
		toggleMode: {
			get() {
				return this.settings.toggleMode;
			},
			set(value) {
				this.updateSetting('toggleMode', String(value));
			}
		},
		showLineInfo: {
			get() {
				return this.settings.showLineInfo;
			},
			set(value) {
				this.updateSetting('showLineInfo', value);
			}
		},
		showBoardCoordinates: {
			get() {
				return !!this.settings.showBoardCoordinates;
			},
			set(value) {
				this.$store.commit('settings/setSetting', {
					key: 'showBoardCoordinates',
					value: value
				})
			}
		},
		enableWakeLock: {
			get() {
				return this.settings.enableWakeLock;
			},
			set(value) {
				this.updateSetting('enableWakeLock', value);
			}
		},
		automaticValidation: {
			get() {
				return this.settings.automaticValidation;
			},
			set(value) {
				this.updateSetting('automaticValidation', value);
			}
		},
		checkButton: {
			get() {
				return this.settings.checkButton;
			},
			set(value) {
				this.updateSetting('checkButton', value);
			}
		},
	},
	methods: {
		updateSetting(key, value) {
			this.$store.commit('settings/setSetting', {
				key,
				value
			});
		}
	}
};
</script>

<style lang="postcss" scoped>
.setting-block {
	@apply block text-gray-900 text-left px-8;
}
</style>