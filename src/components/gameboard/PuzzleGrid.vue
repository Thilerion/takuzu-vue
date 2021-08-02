<template>
	<div
		class="puzzle-grid"
		:class="[`cell-theme-${cellTheme}`]"
	>
		<PuzzleCell
			v-for="cellCoords in coords"
			:key="cellCoords.key"
			:x="cellCoords.x"
			:y="cellCoords.y"
			class="cell"
			:data-row="cellCoords.y"
			:data-col="cellCoords.x"
			@click="cellClick"
			:value="grid[cellCoords.y][cellCoords.x]"
			:theme="cellTheme"
			:hidden="paused"
			:incorrect="incorrectMarkedCells.includes(`${cellCoords.x},${cellCoords.y}`)"
			:style="{ '--x': cellCoords.x, '--y': cellCoords.y }"
		/>

		<PuzzleGridHighlights />
	</div>
</template>

<script>
import PuzzleCell from '@/components/gameboard/PuzzleCell.vue';
import PuzzleGridHighlights from '@/components/gameboard/PuzzleGridHighlights.vue';
import debounce from 'lodash.debounce';

export default {
	components: {
		PuzzleCell,
		PuzzleGridHighlights,
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
			nRows: 0,
			nCols: 0,
			nCells: 0,
			coords: [],
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
	},
	beforeMount() {
		this.nRows = this.rows;
		this.nCols = this.columns;
		this.nCells = this.nRows * this.nCols;
		const coords = [];
		let idx = 0;
		for (let y = 0; y < this.nRows; y++) {
			for (let x = 0; x < this.nCols; x++) {
				coords.push({x, y, key: x + ',' + y, idx});
				idx += 1;
			}
		}
		this.coords = coords;
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

.cell {
	grid-row: calc(var(--y) + 1) / span 1;
	grid-column: calc(var(--x) + 1) / span 1;
}

.cell-bg {
	@apply z-0 absolute w-full h-full;
	@apply bg-gray-200 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-50;
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