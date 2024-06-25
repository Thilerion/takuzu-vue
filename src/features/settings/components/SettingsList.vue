<template>
<FullWidthCardLayout>
	<FullWidthCardBlock>
		<FullWidthCardList>
			<FullWidthCardListItem>
				<LanguageSetting v-model="language" />
			</FullWidthCardListItem>
			<FullWidthCardListItem>
				<DarkModeSetting />
			</FullWidthCardListItem>
			<FullWidthCardListItem>
				<CellThemeSetting v-model="cellTheme" />
			</FullWidthCardListItem>
		</FullWidthCardList>
	</FullWidthCardBlock>

	<FullWidthCardBlock>
		<template #heading>
			<FullWidthCardHeading>{{ $t('Settings.gameplay') }}</FullWidthCardHeading>
		</template>
		<FullWidthCardList>
			<FullWidthCardListItem>
				<GameplayInputModeSetting v-model="toggleMode" />	
			</FullWidthCardListItem>
			<FullWidthCardListItem>
				<WakeLockSetting v-model="enableWakeLock" />
			</FullWidthCardListItem>
			<FullWidthCardListItem>
				<ShowTimerSetting v-model="showTimer" />
			</FullWidthCardListItem>
			<FullWidthCardListItem>
				<VibrationSetting />
			</FullWidthCardListItem>
		</FullWidthCardList>
	</FullWidthCardBlock>

	<FullWidthCardBlock>
		<template #heading>
			<FullWidthCardHeading>{{ $t('Settings.assistance.heading-puzzle-assistance') }}</FullWidthCardHeading>
		</template>
		<FullWidthCardList>
			<FullWidthCardListItem>
				<CheckButtonActionSetting v-model="checkButton" />
			</FullWidthCardListItem>
			<FullWidthCardListItem>
				<GameplayRulerTypeSetting v-model="showLineInfo" />
			</FullWidthCardListItem>
		</FullWidthCardList>
	</FullWidthCardBlock>

	<FullWidthCardBlock>
		<FullWidthCardList>
			<FullWidthCardListItem>
				<AppVersionDisplay
					:debug-mode="isDebugModeEnabled"
					@increment-debug-mode="toggleWithCounter(true)"
				/>
			</FullWidthCardListItem>
		
			<FullWidthCardListItem v-if="isDebugModeEnabled"><router-link to="/debug-options">{{
				$t('Settings.dev.developer-options') }}</router-link></FullWidthCardListItem>
			<FullWidthCardListItem v-if="isDebugModeEnabled">
				<button @click="toggleWithCounter(false)">
					{{ $t('Settings.dev.disable-developer-mode') }}</button>
			</FullWidthCardListItem>
		</FullWidthCardList>
	</FullWidthCardBlock>
</FullWidthCardLayout>
</template>

<script setup lang="ts">
import { useDebugMode } from '@/features/debug-mode/composables/debug-mode-enabled.js';
import { useSettingsStore } from '../store.js';
import { storeToRefs } from 'pinia';

const { enabled: isDebugModeEnabled, toggleWithCounter } = useDebugMode();

const settingsStore = useSettingsStore();
const { cellTheme, checkButton, toggleMode, showLineInfo, enableWakeLock, showTimer, language } = storeToRefs(settingsStore);
</script>