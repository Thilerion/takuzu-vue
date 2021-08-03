<template>
	<header>
		<IconBtn @click="$emit('close')" name="md-close"></IconBtn>
		<span class="font-medium tracking-widest text-xl">{{columns}}x{{rows}}</span>
		<GameBoardDropdown
			@open-settings="openSettings"
			@dropdown-toggled="dropdownToggled"
		/>
	</header>
</template>

<script>
import GameBoardDropdown from './GameBoardDropdown.vue';
export default {
	components: { GameBoardDropdown },
	emits: ['close', 'dropdown-toggled'],
	props: {
		rows: Number,
		columns: Number
	},
	methods: {
		openSettings() {
			this.$router.push({ name: 'PlayPuzzle.settings'});
			this.$emit('dropdown-toggled', false);
		},
		dropdownToggled(value) {
			this.$emit('dropdown-toggled', value);
		}
	}
};
</script>

<style lang="postcss" scoped>
header {
	@apply bg-white dark:bg-gray-800 text-gray-900 dark:text-white;
	@apply flex justify-between items-center h-14 shadow-sm px-2;
}
</style>