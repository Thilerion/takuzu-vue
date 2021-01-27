<template>
	<div class="fixed inset-0 overflow-auto flex flex-col">
		<PageHeader>Settings</PageHeader>
		<select v-model="themePref">
			<option value="light">Light</option>
			<option value="dark">Dark</option>
			<option value="">OS Preference</option>
		</select>	
	</div>
</template>

<script>
import { setDarkTheme, setLightTheme, setThemeOSPref, getThemePref } from '../dark-mode';

export default {
	data() {
		return {
			_themePref: ""
		}
	},
	computed: {
		themePref: {
			get() {
				return this._themePref;
			},
			set(value) {
				if (!value) {
					this._themePref = "";
					setThemeOSPref();
					return;
				}
				else if (value === 'light') setLightTheme();
				else if (value === 'dark') setDarkTheme();
				this._themePref = value;
			}
		}
	},
	beforeMount() {
		this._themePref = getThemePref();
		if (!this._themePref) {
			this._themePref = "";
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>