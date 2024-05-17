<template>
<div class="flex flex-col gap-6 settings-wrapper">
	<div class="py-2">
		<BasicLinkList class="px-4 pb-2 pt-4 flex flex-col">
			<div class="px-2 pb-4">
				<LanguageSetting v-model="language" />
			</div>
			<div class="px-2 pb-4 pt-4">
				<DarkModeSetting />
			</div>
			<div class="px-2 pt-4 pb-4">
				<CellThemeSetting v-model="cellTheme" />
			</div>
		</BasicLinkList>
	</div>

	<div>
		<BasicListHeader>{{ $t('Settings.gameplay') }}</BasicListHeader>
		<BasicLinkList class="px-4 pb-2 pt-4 flex flex-col">
			<div class="px-2 pb-4">
				<GameplayInputModeSetting v-model="toggleMode" />	
			</div>
			<div class="px-2 flex items-center h-14">
				<InputToggle
					id="wakeLockToggle"
					v-model="enableWakeLock"
					class="!m-0"
					small
				>{{
					$t('Settings.wake-lock')
				}}</InputToggle>
			</div>
			<div class="px-2 flex items-center h-14">
				<InputToggle
					id="timerToggle"
					v-model="showTimer"
					class="!m-0"
					small
				>{{ $t('Settings.show-timer') }}
				</InputToggle>
			</div>
			<VibrationSetting class="px-2 pt-4" />
		</BasicLinkList>
	</div>

	<div>
		<BasicListHeader>{{ $t('Settings.assistance.heading-puzzle-assistance') }}</BasicListHeader>
		<BasicLinkList class="divide-none pb-6 pt-4 flex flex-col gap-6">
			<div class="px-2">
				<CheckButtonActionSetting v-model="checkButton" />
			</div>
			<div class="px-2">
				<GameplayRulerTypeSetting v-model="showLineInfo" />
			</div>
		</BasicLinkList>
	</div>

	<BasicLinkList>
		<AppVersionDisplay
			:debug-mode="isDebugModeEnabled"
			@increment-debug-mode="toggleDebugMode(true, { immediate: false })"
		/>
		<BasicLinkListItem v-if="isDebugModeEnabled"><router-link to="/debug-options">{{
			$t('Settings.dev.developer-options') }}</router-link></BasicLinkListItem>
		<BasicLinkListItem v-if="isDebugModeEnabled">
			<button @click="toggleDebugMode(false, { immediate: true })">
				{{ $t('Settings.dev.disable-developer-mode') }}</button>
		</BasicLinkListItem>
	</BasicLinkList>
</div>
</template>

<script setup lang="ts">
import { useDebugMode } from '@/stores/composables/useDebugMode.js';
import { useSettingsStore } from '../store.js';
import { storeToRefs } from 'pinia';

const { enabled: isDebugModeEnabled, toggleDebugMode } = useDebugMode();

const settingsStore = useSettingsStore();
const { cellTheme, checkButton, toggleMode, showLineInfo, enableWakeLock, showTimer, language } = storeToRefs(settingsStore);


</script>