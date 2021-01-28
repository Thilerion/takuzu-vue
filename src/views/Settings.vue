<template>
	<div class="fixed inset-0 overflow-auto flex flex-col">
		<PageHeader>Settings</PageHeader>
		<div class="setting-block">
			<DarkModeSetting />
		</div>
		<div class="setting-block mt-6">
			<h2 class="text-gray-700">Board Display</h2>
			<div class="mt-2">
				<label class="flex items-center">
					<input type="checkbox" v-model="showBoardCoordinates">
					<span class="ml-2">Show board coordinates</span>
				</label>
			</div>
		</div>
	</div>
</template>

<script>
import DarkModeSetting from '../components/settings/DarkModeSetting';

export default {
	components: {
		DarkModeSetting
	},
	data() {
		return {
			
		}
	},
	computed: {
		settings() {
			return this.$store.state.settings;
		},
		showBoardCoordinates: {
			get() {
				return !!this.settings.showBoardCoordinates;
			},
			set(value) {
				this.$store.commit('settings/setSetting', {
					key: 'showBoardCoordinates',
					value: value
				})
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
.setting-block {
	@apply block text-gray-900 text-left px-8;
}
</style>