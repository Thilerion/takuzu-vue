<template>
	<div>
		<h2 class="setting-heading">{{ t('Settings.appThemeMode.theme') }}</h2>
		<div class="mt-2">
			<label class="flex items-center">
				<input type="radio" name="radio-theme" v-model="selectedValue" value="light">
				<span class="ml-2">{{ t('Settings.appThemeMode.light') }}</span>
			</label>
		</div>
		<div class="mt-2">
			<label class="flex items-center">
				<input type="radio" name="radio-theme" v-model="selectedValue" value="dark">
				<span class="ml-2">{{ t('Settings.appThemeMode.dark') }}</span>
			</label>
		</div>
		<div class="mt-2">
			<label class="grid radio-auto-grid">
				<input class="col-start-1 row-start-1 mr-2" type="radio" name="radio-theme" v-model="selectedValue" value="auto">
				<span class="col-start-2 row-start-1 self-center">{{ t('Settings.appThemeMode.auto') }}</span>
				<span class="col-start-2 row-start-2 self-center text-xs opacity-60">{{ t('Settings.appThemeMode.autoDescription', { currentTheme: currentBrowserPreference.toLowerCase() }) }}</span>
			</label>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useThemePreferences } from '@/composables/use-theme-preferences';
import { debouncedWatch } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { baseThemeUserPref: themeValue, setBaseThemePreference: setTheme, baseThemeBrowserPref: currentBrowserPreference } = useThemePreferences();

const selectedValue = ref(themeValue.value);

debouncedWatch(selectedValue, (value) => {
	setTheme(value);
}, { debounce: 600 });

watch(themeValue, (value) => {
	if (value !== selectedValue.value) {
		selectedValue.value = value;
	}
})
</script>

<style scoped>
input[type="radio"] {
	@apply my-1.5;
}

.radio-auto-grid {
	grid-template-columns: max-content 1fr;
	grid-template-rows: auto auto;
}
</style>