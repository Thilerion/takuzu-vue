<template>
	<div>
		<h2 class="setting-heading">Theme</h2>
		<div class="mt-2">
			<label class="flex items-center">
				<input type="radio" name="radio-theme" v-model="selectedValue" value="light">
				<span class="ml-2">Light</span>
			</label>
		</div>
		<div class="mt-2">
			<label class="flex items-center">
				<input type="radio" name="radio-theme" v-model="selectedValue" value="dark">
				<span class="ml-2">Dark</span>
			</label>
		</div>
		<div class="mt-2">
			<label class="grid radio-auto-grid">
				<input class="col-start-1 row-start-1 mr-2" type="radio" name="radio-theme" v-model="selectedValue" value="auto">
				<span class="col-start-2 row-start-1 self-center">Auto</span>
				<span class="col-start-2 row-start-2 self-center text-xs opacity-60">Automatically change theme based on browser/system setting (currently: {{currentBrowserPreference}})</span>
			</label>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useColorSchemePreference } from '@/composables/use-dark-mode-preference.js';
import { debouncedWatch } from '@vueuse/core';

const { mode: themeValue, setColorTheme: setTheme, isDark, isLight, isAuto, currentBrowserPreference } = useColorSchemePreference();

const selectedValue = ref(themeValue.value);

debouncedWatch(selectedValue, (value, prev) => {
	setTheme(value);
}, { debounce: 600 });

watch(themeValue, (value, prev) => {
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