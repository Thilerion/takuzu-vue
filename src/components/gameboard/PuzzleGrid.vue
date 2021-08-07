<template>
	<div
		class="puzzle-grid"
		:class="[`cell-theme-${cellTheme}`]"
	>
	<div
		class="puzzle-cell-wrapper overflow-hidden"
		v-for="cellCoords in coords"
		:key="cellCoords.key"
		:data-x="cellCoords.x"
		:data-y="cellCoords.y"
		:style="{ 'grid-row': `calc(${cellCoords.y} + 1) / span 1`,
		'grid-column': `calc(${cellCoords.x} + 1) / span 1` }"
	>
		<PuzzleCell
			class="cell"
			@click="cellClick"
			:value="gridValues[cellCoords.key]"
			:x="cellCoords.x"
			:y="cellCoords.y"
			:theme="cellTheme"
			:locked="lockedCells[cellCoords.key]"
			:hidden="false"
			:incorrect="false"
		/>
	</div>
		<PuzzleGridHighlights />
	</div>
</template>

<script>
import PuzzleCell from '@/components/gameboard/PuzzleCell.vue';
import PuzzleGridHighlights from '@/components/gameboard/PuzzleGridHighlights.vue';
import debounce from 'lodash.debounce';
import { EMPTY } from '@/lib/constants';

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
			coords: [],
		}
	},
	computed: {
		grid() {
			return this.board.grid;
		},
		gridValues() {
			return this.coords.reduce((acc, {x, y, key}) => {
				acc[key] = this.grid[y][x];
				return acc;
			}, {});
		},
		cellTheme() {
			return this.$store.state.settings.cellTheme;
		},
		vibrateOnTap() {
			return this.$store.state.settings.enableVibration;
		},
		incorrectMarkedCells() {
			return this.$store.state.puzzle.assistance.incorrectCheck.currentMarked;
		},
		numCells() {
			return this.rows * this.columns;
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
		},
		setCoordinates() {
			this.nRows = this.rows;
			this.nCols = this.columns;
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
	},
	created() {
		this.debouncedVibrate = debounce(this.vibrate, this.VIBRATE_DURATION, {
			leading: true,
			trailing: true,
			maxWait: this.VIBRATE_DURATION * 2
		});

		const initialBoard =  this.$store.state.puzzle.initialBoard.grid;
		const lockedCells = {};
		for (let y = 0; y < initialBoard.length; y++) {
			for (let x = 0; x < initialBoard[0].length; x++) {
				const value = initialBoard[y][x];
				if (value !== EMPTY) {
					const key = `${x},${y}`;
					lockedCells[key] = true;
				}
			}
		}
		this.lockedCells = lockedCells;
	},
	watch: {
		numCells: {
			handler() {
				this.setCoordinates();
			},
			immediate: true
		}
	},
};
</script>

<style lang="postcss" scoped>
.puzzle-grid {
	--cell-size-total:  calc(var(--cell-size) - var(--grid-gap));
	grid-area: puzzle-grid;
	grid-template-rows: repeat(var(--rows), var(--cell-size-total));
	grid-template-columns: repeat(var(--columns), var(--cell-size-total));
	@apply mr-auto mb-auto inline-grid relative justify-items-stretch items-stretch;
	gap: var(--grid-gap);
}
.puzzle-paused .puzzle-grid, .puzzle-finished .puzzle-grid {
	@apply pointer-events-none;
}

.puzzle-cell-wrapper {
	position: relative;
	contain: strict;
}

.cell-bg {
	@apply z-0 absolute w-full h-full;
	@apply bg-gray-200 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-50;
}

.touch-anim-el {
	@apply absolute inset-0 pointer-events-none w-full h-full z-30 ring-2 ring-gray-700 opacity-100;
}
.touch-anim-enter-active {
	/* transition: opacity .1s ease; */
}
.touch-anim-leave-active {
	/* transition: opacity 1s ease .4s; */
}
.touch-anim-leave-to, .touch-anim-enter-from {
	/* opacity: 0; */
}
</style>