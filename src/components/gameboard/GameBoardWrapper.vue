<template>
<div class="main justify-center items-center relative" ref="container">
	<div
		class="puzzle-wrapper"
		:class="[`cell-size-${gridGapSizing}`]"
	>
		<slot v-bind="puzzleGridDimensions" />
	</div>
</div>
</template>

<script>
import throttle from 'lodash.throttle';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import { useStore } from 'vuex';

const FPS = 1000 / 30;

export default {
	setup() {
		const container = ref(null);

		const store = useStore();
		const rows = computed(() => store.state.puzzle.height);
		const columns = computed(() => store.state.puzzle.width);

		// use sensible defaults for width and height:
		const width = ref(window.clientWidth * 0.95);
		const height = ref(window.clientHeight * 0.6);

		function setWrapperSizes() {
			const el = container.value;
			if (!el) {
				console.warn('No container element for board.');
				return;
			}
			width.value = el.clientWidth;
			height.value = el.clientHeight;
		};
		function setContainerSize(contentRect) {
			width.value = contentRect.width;
			height.value = contentRect.height;
		}

		const throttledSetContainerSize = throttle(setContainerSize, FPS, {
			leading: false,
			trailing: true
		});
		const roCallback = (entries) => {
			if (!entries.length) return;
			const entry = entries[0];
			// console.log({ entry, entries, contentRect: entry.contentRect });
			const { width, height } = entry.contentRect;
			throttledSetContainerSize({ width, height });
		}
		useResizeObserver(container, roCallback);

		onBeforeUnmount(() => {
			throttledSetContainerSize.cancel();
		})
		onMounted(() => {
			setWrapperSizes();
		})

		return { 
			container,
			
			width,
			height,

			rows,
			columns,

			setWrapperSizes,
			setContainerSize,
		};
	},
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
	},
	computed: {
		gridGapSizing() {
			const { cellSize } = this.puzzleGridDimensions;
			if (cellSize <= 26) {
				return 'xs';
			} else if (cellSize <= 38) {
				return 's';
			} else if (cellSize <= 52) {
				return 'm';
			} else if (cellSize <= 74) {
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
				if (cellSize > 80) cellSize = 80;
				const w = cellSize * this.columns;
				const h = cellSize * this.rows;
				return { width: w + 'px', height: h + 'px', cellSize };
			}
			const widthB = maxHeight * this.aspectRatio;
			let cellSize = Math.floor(widthB / this.columnsWithRuler);
			if (cellSize < 12) cellSize = 12;
			if (cellSize > 80) cellSize = 80;
			const w = cellSize * this.columns;
			const h = cellSize * this.rows;
			return { width: w + 'px', height: h + 'px', cellSize };
		}
	},
};
</script>

<style scoped>
.main {
	@apply flex-1 flex flex-col;
	overflow: hidden;

	--unavail-height: v-bind(heightUnavailable);
	--unavail-width: v-bind(widthUnavailable);
	--rows: v-bind(rows);
	--columns: v-bind(columns);
	--aspect-ratio: calc(var(--columns) / var(--rows));
}

.puzzle-wrapper {
	/* default grid gap for puzzle-grid and rulers */
	--grid-gap: 2px;
	--cell-rounding: 2px;
}
.puzzle-wrapper.cell-size-xs {
	--grid-gap: 1px;
	--cell-rounding: 0px;
}
.puzzle-wrapper.cell-size-s {
	--grid-gap: 1px;
	--cell-rounding: 2px;
}
.puzzle-wrapper.cell-size-m {
	--grid-gap: 2px;
	--cell-rounding: 2px;
}
.puzzle-wrapper.cell-size-l {
	--grid-gap: 3px;
	--cell-rounding: 3px;
}
.puzzle-wrapper.cell-size-xl {
	--grid-gap: 4px;
	--cell-rounding: 4px;
}
</style>