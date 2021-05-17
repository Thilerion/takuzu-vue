<template>
	<div class="board new-board relative">
			<Ruler
				line-type="columns"
				:amount="columns"
				:disabled="!rulerSize || rulerSize === '0px'"
			/>
			<Ruler
				line-type="rows"
				:amount="rows"
				:disabled="!rulerSize || rulerSize === '0px'"			
			/>
			<div class="puzzle-info-wrapper">
				<slot />
			</div>
		<div
			:class="{
				'decreased-padding': decreaseCellPadding,
				'increased-padding': increaseCellPadding,
			}"
			class="puzzle-grid"
			:style="{
				'max-width': gridWidth,
				'max-height': gridHeight,
				'--cell-size': cellSizePx
			}
		">
			<div class="cell" v-for="n in rows * columns" :key="n">
				<div class="inner-celll red" v-if="coloredCells.red.includes(n)"></div>
				<div class="inner-celll blue" v-else-if="coloredCells.blue.includes(n)"></div>
				<div class="inner-celll none" v-else></div>
			</div>
		</div>
	</div>
</template>

<script>
import Ruler from './Ruler';

export default {
	components: {
		Ruler,
	},
	props: {
		rows: Number,
		columns: Number,
		rulerSize: String,
		gridHeight: String,
		gridWidth: String,
		cellSize: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			coloredCells: {
				red: [],
				blue: []
			}
		}
	},
	computed: {
		cells() {
			return Array(this.rows * this.columns)
		},
		cellSizePx() {
			return (this.cellSize ?? 16) + 'px';
		},
		decreaseCellPadding() {
			return this.cellSize < 28;
		},
		increaseCellPadding() {
			return this.cellSize > 48;
		}
	},
	methods: {
		generateColoredCells() {
			const red = [];
			const blue = [];

			for (let i = 0; i < 196; i++) {
				const rnd = Math.random();
				if (rnd < 0.2) red.push(i);
				else if (rnd < 0.4) blue.push(i);
			}
			return {red, blue};
		}
	},
	created() {
		this.coloredCells = this.generateColoredCells();
	}
};
</script>

<style lang="postcss" scoped>
.board {
	@apply inline-grid relative;
	grid-template-areas: "none info"
		"none ruler-cols"
		"ruler-rows puzzle-grid";
}

.puzzle-grid {
	grid-area: puzzle-grid;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: repeat(var(--columns), 1fr);
	@apply mr-auto mb-auto inline-grid relative;
}
.puzzle-grid.decreased-padding {
	gap: 1px;
}
.puzzle-grid.increased-padding {
	gap: 4px;
}

.puzzle-info-wrapper {
	grid-area: info;
	/* Flexbox with child min-width to keep center on overflow */
	@apply relative flex flex-row justify-center w-full items-start;
}

.new-board .cell {
	@apply bg-blue-300 text-xs overflow-hidden flex justify-center items-center bg-opacity-0 rounded-sm p-px;
	width: var(--cell-size);
	height: var(--cell-size);
}
.decreased-padding .cell {
	@apply p-0;
	width: calc(var(--cell-size) - 1px);
	height: calc(var(--cell-size) - 1px);
}
.increased-padding .cell {
	@apply p-0;
	width: calc(var(--cell-size) - 4px);
	height: calc(var(--cell-size) - 4px);
}

.inner-celll {
	@apply m-auto overflow-hidden rounded-sm w-full h-full;
	width: 100%;
	height: 100%;
}

.inner-celll.red {
	@apply bg-red-500 dark:bg-red-500 dark:bg-opacity-90;
}
.inner-celll.blue {
	@apply bg-blue-500 dark:bg-blue-500 dark:bg-opacity-90;
}
.inner-celll.none {
	@apply bg-gray-200 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-50;
}
</style>