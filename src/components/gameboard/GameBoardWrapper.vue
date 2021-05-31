<template>
<div class="main justify-center items-center" ref="container">
	<div
		class="puzzle-wrapper"
		:class="[`cell-size-${gridGapSizing}`]"
		:style="{
			'--unavail-height': heightUnavailable,
			'--unavail-width': widthUnavailable,
			'--aspect-ratio': columns / rows,
			'--rows': rows,
			'--columns': columns,
		}"
	>
		<slot v-bind="puzzleGridDimensions" />
	</div>
</div>
</template>

<script>
import debounce from 'lodash.debounce';
let resizeObserver;

export default {
	props: {
		rulerHeight: String,
		rulerWidth: String,
		infoHeight: String,
		paddingX: {
			type: String,
			default: '4px'
		},
		paddingY: {
			type: String,
			default: '6px'
		},

		rows: Number,
		columns: Number,
	},
	data() {
		return {
			width: 0,
			height: 0,
		}
	},
	computed: {
		gridGapSizing() {
			const { cellSize } = this.puzzleGridDimensions;
			if (cellSize <= 26) {
				return 'xs';
			} else if (cellSize <= 32) {
				return 's';
			} else if (cellSize <= 42) {
				return 'm';
			} else if (cellSize <= 64) {
				return 'l';
			} else {
				return 'xl';
			}
		},
		rowsWithRuler() {
			if (this.rulerHeight === 'cellSize') return this.rows + 1;
			return this.rows;
		},
		columnsWithRuler() {
			if (this.rulerWidth === 'cellSize') return this.columns + 1;
			return this.columns;
		},
		aspectRatio() {
			return this.columnsWithRuler / this.rowsWithRuler;
		},
		heightUnavailable() {
			return [this.rulerHeight, this.infoHeight, this.paddingY, this.paddingY].reduce((total, val) => {
				if (val === 'cellSize') return total;
				let pxVal = val.slice(0, -2) * 1;
				return total + pxVal;
			}, 0);
		},
		widthUnavailable() {
			return [this.rulerWidth, this.paddingX, this.paddingX].reduce((total, val) => {
				if (val === 'cellSize') return total;
				let pxVal = val.slice(0, -2) * 1;
				return total + pxVal;
			}, 0);
		},
		maxDimensionsPuzzleGrid() {
			const maxWidth = this.width - this.widthUnavailable;
			const maxHeight = this.height - this.heightUnavailable;
			return { maxWidth, maxHeight };
		},
		puzzleGridDimensions() {
			const { maxWidth, maxHeight } = this.maxDimensionsPuzzleGrid;

			const heightA = maxWidth / this.aspectRatio;
			if (heightA < maxHeight) {
				let cellSize = Math.floor(heightA / this.rowsWithRuler);
				if (cellSize < 12) cellSize = 12;
				const w = cellSize * this.columns;
				const h = cellSize * this.rows;
				return { width: w + 'px', height: h + 'px', cellSize };
			}
			const widthB = maxHeight * this.aspectRatio;
			let cellSize = Math.floor(widthB / this.columnsWithRuler);
			if (cellSize < 12) cellSize = 12;
			const w = cellSize * this.columns;
			const h = cellSize * this.rows;
			return { width: w + 'px', height: h + 'px', cellSize };
		}
	},
	methods: {
		setWrapperSizes() {
			const el = this.$refs.container;
			if (!el) {
				console.warn('No container element for board.');
				this.width = 100;
				this.height = 100;
				return;
			}
			this.width = el.clientWidth;
			this.height = el.clientHeight;
		},
		setContainerSize({contentRect}) {
			this.width = contentRect.width;
			this.height = contentRect.height;
		}
	},
	mounted() {
		resizeObserver.observe(this.$refs.container);
		this.setWrapperSizes();
	},
	created() {
		const debounced = debounce(this.setContainerSize, 500);
		const fn = (entries) => {
			if (entries.length) {
				debounced(entries[0]);
			}
		}
		resizeObserver = new ResizeObserver(fn);
	},
	beforeUnmount() {
		resizeObserver.disconnect();
		resizeObserver = null;
	},
};
</script>

<style lang="postcss" scoped>
.main {
	@apply flex-1 flex flex-col;
	overflow: hidden;
}

.puzzle-wrapper {
	/* default grid gap for puzzle-grid and rulers */
	--grid-gap: 2px;
	--cell-rounding: theme(borderRadius.sm);
}
.puzzle-wrapper.cell-size-xs {
	--grid-gap: 1px;
	--cell-rounding: 1px;
}
.puzzle-wrapper.cell-size-s {
	--grid-gap: 1px;
	--cell-rounding: theme(borderRadius.sm);
}
.puzzle-wrapper.cell-size-m {
	--grid-gap: 1px;
	--cell-rounding: theme(borderRadius.DEFAULT);
}
.puzzle-wrapper.cell-size-l {
	--grid-gap: 3px;
	--cell-rounding: theme(borderRadius.md);
}
.puzzle-wrapper.cell-size-xl {
	--grid-gap: 4px;
	--cell-rounding: theme(borderRadius.md);
}
</style>