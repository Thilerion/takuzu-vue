<template>
	<div
		class="puzzle-grid"
		:class="[`cell-theme-${cellTheme}`]"
	>
		<template
			v-for="(_row, rowIdx) in rows"
			:key="rowIdx"
		>
			<PuzzleCell
				v-for="(_col, colIdx) in columns"
				class="cell"
				:key="colIdx"
				:data-row="rowIdx"
				:data-col="colIdx"
				@click="cellClick"
				:x="colIdx"
				:y="rowIdx"
				:value="grid[rowIdx][colIdx]"
				:theme="cellTheme"
				:hidden="paused"
				:incorrect="incorrectMarkedCells.includes(`${colIdx},${rowIdx}`)"
			></PuzzleCell>
		</template>
	</div>
</template>

<script>
import PuzzleCell from '@/components/gameboard/PuzzleCell.vue';
import debounce from 'lodash.debounce';

export default {
	components: {
		PuzzleCell
	},
	props: {
		board: {
			type: Object,
			required: true,
		},
		rows: Number,
		columns: Number,
		paused: Boolean,
	},
	emits: ['toggle-cell'],
	data() {
		return {
			VIBRATE_DURATION: 20,	
		}
	},
	computed: {
		grid() {
			return this.board.grid;
		},
		cellTheme() {
			return this.$store.state.settings.cellTheme;
		},
		vibrateOnTap() {
			return this.$store.state.settings.enableVibration;
		},
		incorrectMarkedCells() {
			return this.$store.state.puzzle.assistance.incorrectCheck.currentMarked;
		}
	},
	methods: {
		cellClick({ x, y, value }) {
			this.debouncedVibrate();
			this.$emit('toggle-cell', { x, y, value });
		},
		vibrate() {
			if (!this.vibrateOnTap) return;
			window.navigator.vibrate(this.VIBRATE_DURATION);
		}
	},
	created() {
		this.debouncedVibrate = debounce(this.vibrate, this.VIBRATE_DURATION, {
			leading: true,
			trailing: true,
			maxWait: this.VIBRATE_DURATION * 2
		});
	}
};
</script>

<style lang="postcss" scoped>
.puzzle-grid {
	grid-area: puzzle-grid;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: repeat(var(--columns), 1fr);
	@apply mr-auto mb-auto inline-grid relative;
	gap: var(--grid-gap);
}
.puzzle-paused .puzzle-grid, .puzzle-finished .puzzle-grid {
	@apply pointer-events-none;
}

.cell-bg {
	@apply z-0 absolute w-full h-full;
	@apply bg-gray-200 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-50;
}

.inner-celll {
	@apply m-auto w-full h-full overflow-hidden;
	width: 100%;
	height: 100%;
}
.inner-celll.red {
	@apply z-10 relative;
	@apply bg-red-500 dark:bg-red-500 dark:bg-opacity-90;
}
.inner-celll.blue {
	@apply z-10 relative;
	@apply bg-blue-500 dark:bg-blue-500 dark:bg-opacity-90;
}

.touch-anim-el {
	@apply absolute inset-0 pointer-events-none w-full h-full z-30 ring-2 ring-gray-700 opacity-100;
}
.touch-anim-enter-active {
	transition: opacity .1s ease;
}
.touch-anim-leave-active {
	transition: opacity 1s ease .4s;
}
.touch-anim-leave-to, .touch-anim-enter-from {
	opacity: 0;
}
</style>