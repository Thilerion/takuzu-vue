<template>
	<div
		class="puzzle-wrapper bg-red-200"
		ref="puzzleWrapper"
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
</template>

<script>
export default {
	props: {
		rulerHeight: String,
		rulerWidth: String,
		infoHeight: String,
		paddingX: {
			type: String,
			default: '16px'
		},
		paddingY: {
			type: String,
			default: '8px'
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
			return [this.rulerHeight, this.infoHeight, this.paddingY].reduce((total, val) => {
				let pxVal = val.slice(0, -2) * 1;
				return total + pxVal;
			}, 0);
		},
		widthUnavailable() {
			return [this.rulerWidth, this.paddingX].reduce((total, val) => {
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
				return { width: w + 'px', height: h + 'px'};
			}
			const widthB = maxHeight * this.aspectRatio;
			const cellSize = Math.floor(widthB / this.columns);
			const w = cellSize * this.columns;
			const h = cellSize * this.rows;
			return { width: w + 'px', height: h + 'px' };
		}
	},
	methods: {
		getWrapperSizes() {
			const el = this.$refs.puzzleWrapper.parentNode;
			return {
				width: el.clientWidth,
				height: el.clientHeight
			}
		},
		setWrapperSizes() {
			const {width, height} = this.getWrapperSizes();
			this.width = width;
			this.height = height;
		}
	},
	mounted() {
		this.setWrapperSizes();
	},
	created() {
		window.addEventListener('resize', this.setWrapperSizes);
	},
	unmounted() {
		window.removeEventListener('resize', this.getWrapperSizes);
	}
};
</script>

<style lang="postcss" scoped>

</style>