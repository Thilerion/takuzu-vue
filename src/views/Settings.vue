<template>
	<div class="fixed inset-0 overflow-auto flex flex-col">
		<PageHeader>Settings</PageHeader>
		<div class="block text-gray-900 text-left px-8">
			<h2 class="text-gray-700">Theme</h2>
			<div class="mt-2">
				<label class="flex items-center">
					<input type="radio" name="radio-theme" v-model="themePref" value="">
					<span class="ml-2">OS Preference (default)</span>
				</label>
			</div>
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
		</div>
	</div>
</template>

<script>
import { setTheme, getThemePref } from '../dark-mode';

export default {
	data() {
		return {
			_themePref: "",
			themeTimeout: null
		}
	},
	computed: {
		themePref: {
			get() {
				return this._themePref;
			},
			set(value) {
				clearTimeout(this.themeTimeout);
				this.themeTimeout = setTimeout(() => {
					setTheme(value);
				}, 400);
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