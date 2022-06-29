<template>
	<div class="relative bg-gray-50 dark:bg-slate-900">
		<PageHeader
			@close="closeSettings"
			small
			:elevated="true"
			:transparent="false"
			:hide-back="hideBack"
		>
			<template #default>Settings</template>
			<template #right>
				<BaseDropdown
					align-right
					align-below
				>
					<template #trigger="{toggle}">
						<IconBtn @click="toggle"><icon-ic-baseline-more-vert /></IconBtn>
					</template>
					<template #content="{ close }">
						<BaseDropdownItem @click="resetSettingsToDefaults(close)">Restore default settings</BaseDropdownItem>
					</template>
				</BaseDropdown>
			</template>
		</PageHeader>

		<div class="pb-4 pt-2 flex flex-col gap-6 text-gray-900 dark:text-slate-100 settings-wrapper">
			<div class="py-2">
				<BasicLinkList
					class="divide-none gap-4 px-4 pt-4 pb-6 flex flex-col"
				>
					<div class="px-2">
						<DarkModeSetting />
					</div>
					<div class="px-2">
						<h2>Cell theme</h2>
						<div class="px-0">
							<CellThemeSetting v-model="cellTheme" />
						</div>
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
					<div class="px-2 flex items-center h-14">
						<InputToggle2
							class="!m-0"
							id="wakeLockToggle"
							small
							v-model="enableWakeLock"
						>Keep screen active while playing</InputToggle2>
					</div>
					<div class="px-2 flex items-center h-14">
						<InputToggle2
							class="!m-0"
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
				<BasicLinkList class="divide-none pb-6 pt-4 flex flex-col gap-6">
						<div class="px-2">
							<h3>Check button action</h3>
							<div class="text-xs text-gray-500 dark:text-slate-400">Control whether a "check" button is displayed, and if only rule violations, or all incorrect values are highlighted</div>
							<select class="block w-full mt-2" v-model="checkButton">
								<option :value="CheckButtonOption.DISABLED">Disabled</option>
								<option :value="CheckButtonOption.RULE_VIOLATIONS">Rule violations</option>
								<option :value="CheckButtonOption.INCORRECT_VALUES">Incorrect values</option>
							</select>
						</div>
						<div class="px-2">
							<h3>Board rulers</h3>
							<div class="text-xs text-gray-500 dark:text-slate-400">Choose the information displayed within the rulers next to the puzzle board, or disable them completely.</div>
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

			<BasicLinkList>
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
import { useDebugMode } from '@/stores/composables/useDebugMode';
import { useSettingsStore } from '@/stores/settings/index.js';
import { storeToRefs } from 'pinia';
import { useGlobalBuildData } from '@/app.globals';
import { useThemePreferences } from '@/composables/use-theme-preferences';
import { onBeforeUnmount } from 'vue';
import { CheckButtonOption, rulerType } from '@/stores/settings/options';

const props = defineProps({
	hideBack: Boolean
})

const { enabled: isDebugModeEnabled, toggleDebugMode } = useDebugMode();

const settingsStore = useSettingsStore();
const { cellTheme, checkButton, toggleMode, showLineInfo, enableWakeLock, showTimer } = storeToRefs(settingsStore);

const { setBaseThemeDefault: resetBaseThemeToDefault } = useThemePreferences();

let resetToDefaultsTimeout = null;

const resetSettingsToDefaults = (closeCb) => {
	settingsStore.resetToDefaults();
	resetToDefaultsTimeout = setTimeout(() => {
		resetBaseThemeToDefault();
		resetToDefaultsTimeout = null;
	}, 500);
	closeCb();
}
onBeforeUnmount(() => {
	if (resetToDefaultsTimeout != null) {
		clearTimeout(resetToDefaultsTimeout);
		resetToDefaultsTimeout = null;
		resetBaseThemeToDefault();
	}
})

const lineInfoOptions = [
	{ label: 'Disabled', value: rulerType.NONE },
	{ label: 'Line coordinates', value: rulerType.COORDS},
	{ label: 'Remaining values in line', value: rulerType.COUNT_REMAINING},
	{ label: 'Current values in line', value: rulerType.COUNT_CURRENT}
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