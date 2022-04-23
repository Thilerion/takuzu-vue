<template>
	<header class="flex-shrink-0">
		<div class="w-1/4">
			<IconBtn @click="$emit('close')" name="md-close">
				<icon-ic-baseline-close />
			</IconBtn>
		</div>
		<span class="font-medium tracking-widest text-xl">{{columns}}x{{rows}}</span>
		<div class="flex flex-row w-1/4 justify-end">
			<IconBtn @click="togglePause" class="opacity-80">
				<icon-ic-baseline-pause v-if="!paused" />
				<icon-ic-baseline-play-arrow v-else />
			</IconBtn>
			<GameBoardDropdown
				@open-settings="openSettings"
				@dropdown-toggled="dropdownToggled"
			/>
		</div>
	</header>
	<PuzzleProgressBar v-show="puzzleStore.started" />
</template>

<script>
import { usePuzzleStore } from '@/stores/puzzle.js';
import { toRef } from 'vue';
import GameBoardDropdown from './GameBoardDropdown.vue';
import PuzzleProgressBar from './PuzzleProgressBar.vue';
export default {
	components: { GameBoardDropdown, PuzzleProgressBar },
	emits: ['close', 'dropdown-toggled', 'pause', 'resume'],
	data() {
		return {
			rows: null,
			columns: null
		}
	},
	setup() {
		const puzzleStore = usePuzzleStore();

		const paused = toRef(puzzleStore, 'paused');

		return { puzzleStore, paused };
	},
	methods: {
		openSettings() {
			this.$router.push({ name: 'PlayPuzzle.settings'});
			this.$emit('dropdown-toggled', false);
		},
		dropdownToggled(value) {
			this.$emit('dropdown-toggled', value);
		},
		togglePause() {
			if (this.paused) {
				this.$emit('resume');
			} else this.$emit('pause');
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