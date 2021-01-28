<template>
	<div
		class="board-wrapper font-number"
		:style="{'--line-helper-size': lineHelperSize}"
		ref="boardWrapper"
	>
		<slot :cellSize="cellSize" :cellFontSize="cellFontSize" />
	</div>
</template>

<script>
import throttle from 'lodash.throttle';
import { BASE_PADDING, GAP_SIZE, LINE_HELPER_SIZE } from './config';

export default {
	props: {
		rows: Number,
		columns: Number,
		gap: Number
	},
	data() {
		return {
			boardWrapperSize: {
				width: null,
				height: null,
			},
			resizeObserver: null,
			cellFontSizes: [16, 18, 24, 32, 40, 48]
		}
	},
	computed: {
		showLineHelpers() {
			return this.$store.state.settings.showBoardCoordinates;
		},
		lineHelperRawSize() {
			if (this.showLineHelpers) {
				return LINE_HELPER_SIZE;
			} else {
				return 0;
			}
		},
		lineHelperSize() {
			return this.lineHelperRawSize + 'px';
		},
		cellFontSize() {
			const cellSize = this.cellSize;
			let cellFontSize = this.cellFontSizes[0];

			for (let i = 1; i < this.cellFontSizes.length; i++) {
				if (cellSize - 4 < this.cellFontSizes[i]) {
					break;
				}
				cellFontSize = this.cellFontSizes[i];
			}
			return cellFontSize;
		},
		maxCellWidth() {
			if (this.boardWrapperSize.width == null) return 1;
			return Math.floor((this.availWidth) / this.columns);
		},
		maxCellHeight() {
			if (this.boardWrapperSize.height == null) return 1;
			return Math.floor((this.availHeight) / this.rows);
		},
		cellSize() {
			const max = Math.min(this.maxCellWidth, this.maxCellHeight);
			return (Math.floor(max / 2) * 2); // increments of 2
		},
		availWidth() {
			return this.boardWrapperSize.width - this.totalPaddingWidth;
		},
		availHeight() {
			return this.boardWrapperSize.height - this.totalPaddingHeight;
		},
		totalPaddingWidth() {
			return BASE_PADDING + (GAP_SIZE * this.columns) + this.lineHelperRawSize;
		},
		totalPaddingHeight() {
			return BASE_PADDING + (GAP_SIZE * this.rows) + this.lineHelperRawSize;
		},
	},
	methods: {
		handleResize(entries) {
			for (let entry of entries) {
				const {width, height} = entry.contentRect;
				this.boardWrapperSize = {width, height};
			}
		},
		createResizeObserver() {
			if (this.resizeObserver != null) {
				return;
			}
			const throttledFn = throttle((entries) => {
				this.handleResize(entries);
			}, 250);
			const resizeObserver = new ResizeObserver(throttledFn);
			this.resizeObserver = resizeObserver;
			this.resizeObserver.observe(this.$refs.boardWrapper);
		},
		deleteResizeObserver() {
			this.resizeObserver.disconnect();
		}
	},
	mounted() {
		const rect = this.$refs.boardWrapper.getBoundingClientRect();
		this.boardWrapperSize = {
			width: rect.width,
			height: rect.height
		}
		this.createResizeObserver();
	},
	beforeUnmount() {
		this.deleteResizeObserver();
	}
};
</script>

<style lang="postcss" scoped>
.board-wrapper {
	@apply flex-1 overflow-hidden flex items-center justify-center;
}
</style>