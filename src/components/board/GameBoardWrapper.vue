<template>
	<div
		ref="boardWrapper"
		class="flex-1 overflow-hidden flex items-center justify-center font-number relative px-1"
		:style="cssVars"
	>
		<slot />
	</div>
</template>

<script>
import { LINE_INFO_COORD_SIZE, MAX_FONT_SIZE, MIN_FONT_SIZE } from './config';
import throttle from 'lodash.throttle';

export default {
	data() {
		return {
			lineInfoCoordsSize: LINE_INFO_COORD_SIZE,

			totalWidth: 1,
			totalHeight: 1,
			resizeObserver: null,
		}
	},
	computed: {
		board() {
			return this.$store.state.game.board;
		},
		boardColumns() {
			return this.board.width;
		},
		boardRows() {
			return this.board.height;
		},

		hasLineInfoPadding() {
			return this.$store.getters['settings/boardHasLineInfoPadding'];
		},
		hasLineCountPadding() {
			return this.$store.getters['settings/showBoardLineCounts'];
		},
		hasLineCoordPadding() {
			return this.$store.getters['settings/showBoardCoordinates'];
		},

		// NEW CALCULATIONS
		gapSize() {
			const approxW = this.totalWidth / (this.boardColumns + 0.5);
			const approxH = this.totalHeight / (this.boardRows + 0.5);
			const approx = Math.min(approxW, approxH);

			if (approx < 28) return 1;
			if (approx < 44) return 2;
			if (approx < 60) return 3;
			return 4;
		},
		numGapsWidth() {
			return this.boardColumns + 2;
		},
		numGapsHeight() {
			return this.boardRows + 2;
		},
		gapWidth() {
			return this.gapSize * this.numGapsWidth;
		},
		gapHeight() {
			return this.gapSize * this.numGapsHeight;
		},
		lineInfoPadding() {
			if (this.hasLineCoordPadding) {
				return this.lineInfoCoordsSize;
			} else return 0;
		},
		availSpaceWidth() {
			const w = this.totalWidth;
			return w - this.gapWidth - this.lineInfoPadding;
		},
		availSpaceHeight() {
			const h = this.totalHeight;
			return h - this.gapHeight - this.lineInfoPadding;
		},
		numCellsWidth() {
			const cols = this.boardColumns;
			if (this.hasLineCountPadding) return cols + 1;
			return cols;
		},
		numCellsHeight() {
			const rows = this.boardRows;
			if (this.hasLineCountPadding) return rows + 1;
			return rows;
		},
		maxCellHeight() {
			return Math.floor(this.availSpaceHeight / this.numCellsHeight);
		},
		maxCellWidth() {
			return Math.floor(this.availSpaceWidth / this.numCellsWidth)
		},

		// CALCULATIONS
		lineInfoSize() {
			if (this.hasLineCountPadding) {
				return this.cellSize;
			} else if (this.hasLineCoordPadding) {
				return this.lineInfoCoordsSize;
			} else return 0;
		},
		baseCellSize() {
			const base = Math.min(this.maxCellHeight, this.maxCellWidth);
			return (Math.floor(base / 2) * 2); // increments of 2
		},
		cellSize() {
			let inc = Math.floor(this.baseCellSize / 2) * 2;
			if (inc < 20) return 20;
			if (inc > 80) return 80;
			return inc;
		},
		cellFontSize() {
			return Math.min(Math.max(this.cellSize - 2, MIN_FONT_SIZE), MAX_FONT_SIZE);
		},

		cssVars() {
			return {
				'--cell-size': this.cellSize + 'px',
				'--cell-font-size': this.cellFontSize + 'px',
				'--grid-rows': this.boardRows + 2,
				'--grid-cols': this.boardColumns + 2,
				'--board-rows': this.boardRows,
				'--board-cols': this.boardColumns,
				'--grid-gap': this.gapSize + 'px',
				'--line-helper-size': this.lineInfoSize + 'px'
			}
		}
	},

	methods: {
		getWrapperSizeFromRect() {
			const el = this.$refs.boardWrapper;
			if (!el) {
				this.setWrapperSize(1, 1);
				return;
			} else {
				const rect = el.getBoundingClientRect();
				this.setWrapperSize(rect.width, rect.height);
			}
		},
		setWrapperSize(width = 1, height = 1) {
			this.totalWidth = width;
			this.totalHeight = height;
		},

		handleResize(entries) {
			if (entries.length > 1) {
				throw new Error('Entries more than 1?');
			}
			const { width, height } = entries[0].contentRect;
			this.setWrapperSize(width, height);
		},

		createResizeObserver() {
			if (this.resizeObserver != null) return;

			const throttledFn = throttle(this.handleResize, 10);
			this.resizeObserver = new ResizeObserver(throttledFn);
			this.resizeObserver.observe(this.$refs.boardWrapper);
		},
		deleteResizeObserver() {
			if (this.resizeObserver != null) {
				this.resizeObserver.disconnect();
			}
		}
	},

	mounted() {
		this.getWrapperSizeFromRect();
		this.createResizeObserver();
	},
	beforeUnmount() {
		this.deleteResizeObserver();
	},
};
</script>

<style lang="postcss" scoped>
	
</style>