<template>
	<div
		ref="boardWrapper"
		class="flex-1 overflow-hidden flex items-center justify-center font-number p-2 relative"
		:style="cssVars"
	>
		<slot />
	</div>
</template>

<script>
import { BASE_PADDING, GAP_SIZE, LINE_HELPER_SIZE, MAX_FONT_SIZE, MIN_FONT_SIZE } from './config';
import throttle from 'lodash.throttle';

export default {
	data() {
		return {
			gapSize: GAP_SIZE,
			basePadding: BASE_PADDING,
			lineHelperSize: LINE_HELPER_SIZE,

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

		showBoardCoordinates() {
			return this.$store.state.settings.showBoardCoordinates;
		},

		// CALCULATIONS
		lineHelperPadding() {
			if (this.showBoardCoordinates) {
				return this.lineHelperSize;
			} else {
				return 0;
			}
		},
		sidePadding() {
			// if no boardCoords, remove 1* gapSize as it is part of the padding
			if (this.showBoardCoordinates) {
				return (this.basePadding * 2) - this.gapSize;
			} else {
				return (this.basePadding * 2) - (this.gapSize * 2);
			}
		},
		gapWidth() {
			return (this.boardColumns + 1) * this.gapSize;
		},
		gapHeight() {
			return (this.boardRows + 1) * this.gapSize;
		},
		totalPaddingHeight() {
			return this.sidePadding + this.gapHeight;
		},
		totalPaddingWidth() {
			return this.sidePadding + this.gapWidth;
		},
		maxCellHeight() {
			const size = this.totalHeight - this.totalPaddingHeight;
			return Math.floor(size / this.boardRows);
		},
		maxCellWidth() {
			const size = this.totalWidth - this.totalPaddingWidth;
			return Math.floor(size / this.boardColumns);
		},
		cellSize() {
			const base = Math.min(this.maxCellHeight, this.maxCellWidth);
			return (Math.floor(base / 2) * 2); // increments of 2
		},
		cellFontSize() {
			return Math.min(Math.max(this.cellSize - 2, MIN_FONT_SIZE), MAX_FONT_SIZE);
		},

		cssVars() {
			const lineHelperSize = this.showBoardCoordinates ? this.lineHelperSize : 0;
			return {
				'--cell-size': this.cellSize + 'px',
				'--cell-font-size': this.cellFontSize + 'px',
				'--grid-rows': this.boardRows + 2,
				'--grid-cols': this.boardColumns + 2,
				'--board-rows': this.boardRows,
				'--board-cols': this.boardColumns,
				'--grid-gap': this.gapSize + 'px',
				'--line-helper-size': lineHelperSize + 'px'
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

			const throttledFn = throttle(this.handleResize, 250);
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
	}
};
</script>

<style lang="postcss" scoped>
	
</style>