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
		<div class="puzzle-grid" :style="{width: gridWidth, height: gridHeight}">
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
	@apply bg-green-300;
	grid-area: puzzle-grid;
	display: grid;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: repeat(var(--columns), 1fr);
}

.puzzle-info-wrapper {
	grid-area: info;
	/* Flexbox with child min-width to keep center on overflow */
	@apply relative flex flex-row justify-center w-full items-start;
}

.new-board .cell {
	@apply bg-blue-300 text-xs overflow-hidden flex justify-center items-center bg-opacity-0 rounded-sm;
	/* aspect-ratio: 1; */
	padding: var(--cell-padding);
	min-height: 1rem;
	min-width: 1rem;
	width: var(--cell-size);
	height: var(--cell-size);
}

.inner-celll {
	@apply m-auto overflow-hidden rounded-sm;
	width: calc(100% - var(--cell-padding) * 2);
	height: calc(100% - var(--cell-padding) * 2);
}

.inner-celll.red {
	@apply bg-red-500 dark:bg-red-600 dark:bg-opacity-70;
}
.inner-celll.blue {
	@apply bg-blue-500 dark:bg-blue-600 dark:bg-opacity-90;
}
.inner-celll.none {
	@apply bg-gray-100 dark:bg-gray-600 dark:bg-opacity-25;
}
</style>