<template>
	<header class="flex-shrink-0">
		<IconBtn @click="$emit('close')" name="md-close">
			<icon-ic-baseline-close />
		</IconBtn>
		<span class="font-medium tracking-widest text-xl">{{columns}}x{{rows}}</span>
		<GameBoardDropdown
			@open-settings="openSettings"
			@dropdown-toggled="dropdownToggled"
		/>
	</header>
	<PuzzleProgressBar v-show="puzzleStore.started" />
</template>

<script>
import { usePuzzleStore } from '@/stores/puzzle.js';
import GameBoardDropdown from './GameBoardDropdown.vue';
import PuzzleProgressBar from './PuzzleProgressBar.vue';
export default {
	components: { GameBoardDropdown, PuzzleProgressBar },
	emits: ['close', 'dropdown-toggled'],
	data() {
		return {
			rows: null,
			columns: null
		}
	},
	setup() {
		const puzzleStore = usePuzzleStore();
		return { puzzleStore };
	},
	methods: {
		openSettings() {
			this.$router.push({ name: 'PlayPuzzle.settings'});
			this.$emit('dropdown-toggled', false);
		},
		dropdownToggled(value) {
			this.$emit('dropdown-toggled', value);
		}
	},
	computed: {
		storeRows() {
			return this.puzzleStore.height;
		},
		storeColumns() {
			return this.puzzleStore.width;
		},
		storeDims() {
			return [this.storeRows, this.storeColumns];
		}
	},
	watch: {
		storeDims: {
			handler() {
				const r = this.storeRows;
				const c = this.storeColumns;
				if (r != null) {
					this.rows = r;
				}
				if (c != null) {
					this.columns = c;
				}
			},
			immediate: true
		}
	}
};
</script>

<style scoped>
header {
	@apply bg-white dark:bg-gray-800 text-gray-900 dark:text-white;
	@apply flex justify-between items-center h-14 shadow-sm px-2;
}
</style>