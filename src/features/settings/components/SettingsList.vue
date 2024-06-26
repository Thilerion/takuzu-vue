<template>
<FullWidthPanelLayout>
	<FullWidthPanelList>
		<template #content>
			<FullWidthPanelListItem class="py-4">
				<LanguageSetting v-model="language" />
			</FullWidthPanelListItem>
			<FullWidthPanelListItem class="py-4">
				<DarkModeSetting />
			</FullWidthPanelListItem>
			<FullWidthPanelListItem class="py-4">
				<CellThemeSetting v-model="cellTheme" />
			</FullWidthPanelListItem>
		</template>
	</FullWidthPanelList>

	<FullWidthPanelList>
		<template #sectionTitle>{{ $t('Settings.gameplay') }}</template>
		<template #content>
			<FullWidthPanelListItem class="py-4">
				<GameplayInputModeSetting v-model="toggleMode" />	
			</FullWidthPanelListItem>
			<FullWidthPanelListItem class="py-4">
				<WakeLockSetting v-model="enableWakeLock" />
			</FullWidthPanelListItem>
			<FullWidthPanelListItem class="py-4">
				<ShowTimerSetting v-model="showTimer" />
			</FullWidthPanelListItem>
			<FullWidthPanelListItem class="py-4">
				<VibrationSetting />
			</FullWidthPanelListItem>
		</template>
	</FullWidthPanelList>

	<FullWidthPanelList>
		<template #sectionTitle>{{ $t('Settings.assistance.heading-puzzle-assistance') }}</template>
		<template #content>
			<FullWidthPanelListItem class="py-4">
				<CheckButtonActionSetting v-model="checkButton" />
			</FullWidthPanelListItem>
			<FullWidthPanelListItem class="py-4">
				<GameplayRulerTypeSetting v-model="showLineInfo" />
			</FullWidthPanelListItem>
		</template>
	</FullWidthPanelList>

	<FullWidthPanelList>
		<template #content>
			<FullWidthPanelListItem class="py-4">
				<AppVersionDisplay
					:debug-mode="isDebugModeEnabled"
					@increment-debug-mode="toggleWithCounter(true)"
				/>
			</FullWidthPanelListItem>
		
			<FullWidthPanelListItem
				v-if="isDebugModeEnabled"
				class="h-14"
				no-padding-y
				tag="router-link"
				to="/debug-options"
			>{{ $t('Settings.dev.developer-options') }}</FullWidthPanelListItem>

			<FullWidthPanelListItem
				v-if="isDebugModeEnabled"
				class="h-14"
				no-padding-y
				tag="button"
				@click="toggleWithCounter(false)"
			>{{ $t('Settings.dev.disable-developer-mode') }}</FullWidthPanelListItem>
		</template>
	</FullWidthPanelList>
</FullWidthPanelLayout>
</template>

<script setup lang="ts">
import { useDebugMode } from '@/features/debug-mode/composables/debug-mode-enabled.js';
import { useSettingsStore } from '../store.js';
import { storeToRefs } from 'pinia';

const { enabled: isDebugModeEnabled, toggleWithCounter } = useDebugMode();

const settingsStore = useSettingsStore();
const { cellTheme, checkButton, toggleMode, showLineInfo, enableWakeLock, showTimer, language } = storeToRefs(settingsStore);
</script>