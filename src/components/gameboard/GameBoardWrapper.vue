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
			...puzzleGridDimensions
		}"
	>
		<!-- {{maxDimensionsPuzzleGrid.maxWidth}},{{maxDimensionsPuzzleGrid.maxHeight}} -->
	</div>
</template>

<script>
export default {
	props: {
		headerHeight: String,
		controlsHeight: String,
		rulerHeight: String,
		rulerWidth: String,
		infoHeight: String,

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
			return [this.rulerHeight, this.infoHeight].reduce((total, val) => {
				let pxVal = val.slice(0, -2) * 1;
				return total + pxVal;
			}, 0);
		},
		widthUnavailable() {
			return [this.rulerWidth].reduce((total, val) => {
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

			const a = maxWidth / this.aspectRatio;
			if (a < maxHeight) {
				return { width: maxWidth + 'px', height: a + 'px'};
			}
			const b = maxHeight * this.aspectRatio;
			return { width: b + 'px', height: maxHeight + 'px'};
		}
	},
	methods: {
		getWrapperSizes() {
			const el = this.$refs.puzzleWrapper.parentNode;
			console.dir(el);
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