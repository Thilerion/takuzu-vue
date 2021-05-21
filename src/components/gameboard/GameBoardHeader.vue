<template>
	<header>
		<IconBtn @click="$emit('close')">close</IconBtn>
		<button @click="$emit('cycle-size')" class="font-medium tracking-widest text-xl">{{columns}}x{{rows}}</button>
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
	emits: ['cycle-size', 'close'],
	props: {
		rows: Number,
		columns: Number
	},
	methods: {
		openSettings() {
			console.warn('TODO: open settings from game board header');
			// TODO: open settings
			// TODO: set game paused when settings open
		},
		dropdownToggled(value) {
			// TODO: set game paused when dropdown open
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