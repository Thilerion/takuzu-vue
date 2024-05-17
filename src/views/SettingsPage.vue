<template>
<div class="relative bg-gray-50 dark:bg-slate-900">
	<PageHeader
		small
		:elevated="true"
		:transparent="false"
		:hide-back="hideBack"
		back-options="Home"
	>
		<template #default>{{ $t('Settings.title') }}</template>
		<template #right>
			<BaseDropdown align-right align-below>
				<template #trigger="{ toggle }">
					<IconBtn @click="toggle"><icon-ic-baseline-more-vert /></IconBtn>
				</template>
				<template #content="{ close }">
					<BaseDropdownItem @click="resetSettingsToDefaults(close)">
						{{ $t('Settings.restore-default-settings') }}
					</BaseDropdownItem>
				</template>
			</BaseDropdown>
		</template>
	</PageHeader>

	<SettingsList class="pb-4 pt-2 text-gray-900 dark:text-slate-100" />
</div>
</template>

<script setup lang="ts">
import { useThemePreferences } from '@/features/settings/composables/use-theme-preferences.js';
import { useSettingsStore } from '@/features/settings/store.js';
import { onBeforeUnmount } from 'vue';

defineProps<{
	hideBack?: boolean
}>();

const { setBaseThemeDefault: resetBaseThemeToDefault } = useThemePreferences();

let resetToDefaultsTimeout: null | number = null;
const settingsStore = useSettingsStore();
const resetSettingsToDefaults = (closeCb: () => void) => {
	settingsStore.resetToDefaults();
	resetToDefaultsTimeout = window.setTimeout(() => {
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
</script>