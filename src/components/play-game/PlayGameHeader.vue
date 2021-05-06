<template>
	<PageHeader close-btn @close="$emit('close')">
		{{columns}}x{{rows}}
		<template #right>
			<BaseDropdown align-right align-below ref="dropdown">
				<template #trigger="{open}">
					<IconBtn @click="open">more_vert</IconBtn>
				</template>
				<template #content>
					<BaseDropdownItem disabled>
						<span class="material-icons opacity-90 text-base">bookmark_add</span>
						<span class="ml-3 mt-px">Set bookmark</span>
					</BaseDropdownItem>
					<BaseDropdownItem disabled>
						<span class="material-icons opacity-90 text-base">bookmark_remove</span>
						<span class="ml-3 mt-px">Delete bookmark</span>
					</BaseDropdownItem>
					<BaseDropdownDivider/>
					<BaseDropdownItem>
						<label class="flex items-center">
							<input type="checkbox" v-model="showTimer">
							<span class="ml-2">Show timer</span>
						</label>
					</BaseDropdownItem>
					<BaseDropdownDivider/>
					<BaseDropdownItem @click="goToSettings"
					>
						<span class="material-icons opacity-90 text-base">settings</span>
						<span class="ml-3 mt-px">Settings</span>
					</BaseDropdownItem>
				</template>
			</BaseDropdown>
		</template>
	</PageHeader>
</template>

<script>
export default {
	props: [
		'columns', 'rows',
	],
	emits: ['close', 'open-settings'],
	computed: {
		showTimer: {
			get() {
				return this.$store.state.settings.showTimer;
			},
			set(value) {
				this.$store.commit('settings/setSetting', {
					key: 'showTimer',
					value
				});
			}
		}
	},
	methods: {
		goToSettings() {
			this.$refs.dropdown.closeDropdownMenu();
			this.$emit('open-settings');
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>