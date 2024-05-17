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
				<h3>{{ $t('Settings.input-mode.label') }}</h3>
				<div class="text-xs text-gray-500 dark:text-slate-400">{{ $t('Settings.input-mode.description') }}
				</div>
				<div class="mt-2">
					<label class="flex items-center">
						<input
							v-model="toggleMode"
							type="radio"
							name="radio-toggle-mode"
							value="0"
						>
						<i18n-t 
							keypath="Settings.input-mode.toggle-symbol-first"
							tag="span"
							class="ml-2"
							scope="global"
						>
							<template #symbol>
								<PuzzleSymbolDisplay :v="ZERO" />
							</template>
						</i18n-t>
						<span class="text-xs opacity-50 ml-2">({{ $t('default') }})</span>
					</label>
				</div>
				<div class="mt-2">
					<label class="flex items-center">
						<input
							v-model="toggleMode"
							type="radio"
							name="radio-toggle-mode"
							value="1"
						>
						<i18n-t 
							keypath="Settings.input-mode.toggle-symbol-first"
							tag="span"
							class="ml-2"
							scope="global"
						>
							<template #symbol>
								<PuzzleSymbolDisplay :v="ONE" />
							</template>
						</i18n-t>
					</label>
				</div>
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
				<h3>{{ $t('Settings.assistance.check-button-action') }}</h3>
				<div class="text-xs text-gray-500 dark:text-slate-400">{{
					$t('Settings.assistance.check-button-description') }}</div>
				<select v-model="checkButton" class="block w-full mt-2">
					<option :value="CheckButtonOption.DISABLED">{{ $t('disabled') }}</option>
					<option :value="CheckButtonOption.RULE_VIOLATIONS">{{ $t('Game.mistake.rule-violation', 2) }}</option>
					<option :value="CheckButtonOption.INCORRECT_VALUES">{{ $t('Game.mistake.incorrect-value', 2) }}</option>
				</select>
			</div>
			<div class="px-2">
				<h3>{{ $t('Settings.rulers.board-rulers') }}</h3>
				<div class="text-xs text-gray-500 dark:text-slate-400">{{
					$t('Settings.rulers.description-choose-the-information-displayed-within') }}</div>
				<div class="mt-2">
					<select v-model="showLineInfo" class="block w-full mt-1">
						<option
							v-for="opt in lineInfoOptions"
							:key="opt.value"
							:value="opt.value"
						>{{ opt.label }}
						</option>
					</select>
				</div>
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
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { CheckButtonOption, rulerType } from '../options.js';
import { ZERO, ONE } from '@/lib/constants.js';
import { storeToRefs } from 'pinia';

const { enabled: isDebugModeEnabled, toggleDebugMode } = useDebugMode();

const settingsStore = useSettingsStore();
const { cellTheme, checkButton, toggleMode, showLineInfo, enableWakeLock, showTimer, language } = storeToRefs(settingsStore);

const { t } = useI18n();
const lineInfoOptions = computed(() => [
	{ label: t('disabled'), value: rulerType.NONE },
	{ label: t('Settings.rulers.line-coordinates'), value: rulerType.COORDS },
	{ label: t('Settings.rulers.remaining-values-in-line'), value: rulerType.COUNT_REMAINING },
	{ label: t('Settings.rulers.current-values-in-line'), value: rulerType.COUNT_CURRENT }
])
</script>