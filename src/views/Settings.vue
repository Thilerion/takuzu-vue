<template>
	<div>
		<PageHeader
			@close="closeSettings"
			small
			:elevated="true"
			:transparent="false"
			:hide-back="hideBack"
		>Settings</PageHeader>

		<div class="pb-6 pt-2 flex flex-col gap-6">
			<div class="py-2">
				<BasicLinkList
					class="divide-y divide-gray-150/0 bg-white px-4 rounded-xl shadow-lg pb-2"
				>
					<div class="py-4 px-2">
						<DarkModeSetting />
					</div>
					<div class="py-4 px-2">
						<h2>Cell theme</h2>
						<CellThemeSetting v-model="cellTheme" />
					</div>
				</BasicLinkList>
			</div>

			<div>
				<BasicListHeader>Gameplay</BasicListHeader>
				<BasicLinkList class="px-4 pb-2 pt-4 flex flex-col">
					<div class="px-2 pb-4">
						<h3>Input mode</h3>
						<div class="mt-2">
							<label class="flex items-center">
								<input type="radio" name="radio-toggle-mode" v-model="toggleMode" value="0">
								<span class="ml-2">Toggle <span class="text-cell-blues">0</span> first</span><span class="text-xs opacity-50 ml-2">(default)</span>
							</label>
						</div>
						<div class="mt-2">
							<label class="flex items-center">
								<input type="radio" name="radio-toggle-mode" v-model="toggleMode" value="1">
								<span class="ml-2">Toggle <span class="text-cell-reds">1</span> first</span>
							</label>
						</div>
					</div>
					<div class="px-2">
						<InputToggle2
							class="mb-0 !h-12"
							id="wakeLockToggle"
							small
							v-model="enableWakeLock"
						>Keep screen active while playing</InputToggle2>
					</div>
					<div class="px-2">
						<InputToggle2
							class="mb-0 !h-12"
							small
							id="timerToggle"
							v-model="showTimer"
						>Show timer</InputToggle2>
					</div>
					<VibrationSetting
						class="px-2 pt-4"
					/>
				</BasicLinkList>
			</div>

			<div>
				<BasicListHeader>Puzzle assistance</BasicListHeader>
				<BasicLinkList class="bg-white px-4 rounded-xl shadow-lg transition-all duration-700 divide-none pb-6 pt-4 flex flex-col gap-6">
						<div class="px-2">
							<h3>Check button action</h3>
							<div class="text-xs text-gray-500">Control whether a "check" button is displayed, and if only rule violations, or all incorrect values are highlighted</div>
							<select class="block w-full mt-2" v-model="checkButton">
								<option value="disabled">Disabled</option>
								<option value="ruleViolations">Rule violations</option>
								<option value="incorrectValues">Incorrect values</option>
							</select>
						</div>
						<div class="px-2">
							<h3>Board rulers</h3>
							<div class="text-xs text-gray-500">Choose the information displayed within the rulers next to the puzzle board, or disable them completely.</div>
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
				</BasicLinkList>
			</div>

			<BasicLinkList
				class="divide-y divide-gray-150 bg-white px-4 rounded-xl shadow-lg"
			>
				<BasicLinkListItem>
					<button
						@click="toggleDebugMode(true, { immediate: false })"
						:disabled="isDebugModeEnabled"
					>
					<span class="mr-4 text-base">App version:</span>{{ pkgVersion }}_<small>{{buildDate}}</small>
					</button>
				</BasicLinkListItem>
				<BasicLinkListItem v-if="isDebugModeEnabled"><router-link to="/debug-options">Developer options</router-link></BasicLinkListItem>
				<BasicLinkListItem
					v-if="isDebugModeEnabled"
				>
					<button
						@click="toggleDebugMode(false, { immediate: true })"
					>Disable developer mode</button>
				</BasicLinkListItem>
			</BasicLinkList>
		</div>
	</div>
</template>

<script setup>
import CellThemeSetting from '@/components/settings/CellThemeSetting.vue';
import DarkModeSetting from '../components/settings/DarkModeSetting.vue';
import { useDebugMode } from '@/stores/composables/useDebugMode';
import { useSettingsStore } from '@/stores/settings';
import { storeToRefs } from 'pinia';
import { useGlobalBuildData } from '@/app.globals';

const props = defineProps({
	hideBack: Boolean
})

const { enabled: isDebugModeEnabled, toggleDebugMode } = useDebugMode();

const settingsStore = useSettingsStore();
const { cellTheme, checkButton, toggleMode, showLineInfo, enableWakeLock, showTimer } = storeToRefs(settingsStore);

const lineInfoOptions = [
	{ label: 'Disabled', value: '' },
	{ label: 'Line coordinates', value: 'coords'},
	{ label: 'Remaining values in line', value: 'remainingCount'},
	{ label: 'Current values in line', value: 'currentCount'}
]

const { pkgVersion, buildDate } = useGlobalBuildData();

const closeSettings = () => {
	const prev = this.$route.meta.prev;
	if (this.$route.name === 'PlayPuzzle.settings') {
		if (prev == null || (prev && prev.name !== 'PlayPuzzle')) this.$router.replace({ name: 'PlayPuzzle' });
		else this.$router.go(-1);
	} else {
		if (prev) this.$router.go(-1);
		else this.$router.replace({ name: 'Home' });
	}
}
</script>

<style scoped>

</style>