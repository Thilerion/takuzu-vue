<template>
<div class="main justify-center items-center" ref="container">
	<div
		class="puzzle-wrapper"
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
		aspectRatio() {
			return this.columns / this.rows;
		},
		heightUnavailable() {
			return [this.rulerHeight, this.infoHeight, this.paddingY, this.paddingY].reduce((total, val) => {
				let pxVal = val.slice(0, -2) * 1;
				return total + pxVal;
			}, 0);
		},
		widthUnavailable() {
			return [this.rulerWidth, this.paddingX, this.paddingX].reduce((total, val) => {
				let pxVal = val.slice(0, -2) * 1;
				return total + pxVal;
			}, 0);
		},
		maxDimensionsPuzzleGrid() {
			const maxWidth = this.width - this.widthUnavailable;
			const maxHeight = this.height - this.heightUnavailable;
			return {maxWidth, maxHeight};
		},
		puzzleGridDimensions() {
			const {maxWidth, maxHeight} = this.maxDimensionsPuzzleGrid;

			const heightA = maxWidth / this.aspectRatio;
			if (heightA < maxHeight) {
				const cellSize = Math.floor(heightA / this.rows);
				const w = cellSize * this.columns;
				const h = cellSize * this.rows;
				return { width: w + 'px', height: h + 'px', cellSize };
			}
			const widthB = maxHeight * this.aspectRatio;
			const cellSize = Math.floor(widthB / this.columns);
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
</style>