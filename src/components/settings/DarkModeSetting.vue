<template>
	<div>
		<h2 class="setting-heading">Theme</h2>
		<div class="mt-2">
			<label class="flex items-center">
				<input type="radio" name="radio-theme" v-model="themePref" value="light">
				<span class="ml-2">Light</span>
			</label>
		</div>
		<div class="mt-2">
			<label class="flex items-center">
				<input type="radio" name="radio-theme" v-model="themePref" value="dark">
				<span class="ml-2">Dark</span>
			</label>
		</div>
		<div class="mt-2">
			<label class="flex items-center">
				<input type="radio" name="radio-theme" v-model="themePref" value="auto">
				<span class="ml-2">Automatic (OS preference)</span>
			</label>
		</div>
	</div>
</template>

<script>
import { computed, ref } from 'vue';
import { useColorSchemePreference } from '@/composables/use-dark-mode-preference.js';
export default {
	setup() {
		const { mode: themeValue, setColorTheme: setTheme, isDark, isLight, isAuto } = useColorSchemePreference();

		const _selectedValue = ref('auto');

		if (themeValue.value != null && ['auto', 'light', 'dark'].includes(themeValue.value)) {
			_selectedValue.value = themeValue.value;
		}

		let themeTimeout = null;

		const themePref = computed({
			get() {
				return _selectedValue.value;
			},
			set(value) {
				clearTimeout(themeTimeout);
				themeTimeout = setTimeout(() => {
					setTheme(value);
					themeTimeout = null;
				}, 600);
			}
		})

		return { themePref, isDark, isLight, isAuto };
	},
};
</script>

<style scoped>
	
</style>