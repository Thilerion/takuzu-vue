<template>
	<div class="board new-board relative" :style="cssVars">
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
		<div class="cell" v-for="n in rows * columns" :key="n">
			<div class="inner-celll red" v-if="coloredCells.red.includes(n)"></div>
			<div class="inner-celll blue" v-else-if="coloredCells.blue.includes(n)"></div>
			<div class="inner-celll none" v-else></div>
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
		headerHeight: {
			type: String,
			default: '64px'
		},
		controlsHeight: {
			type: String,
			default: '96px'
		},
		rulerSize: {
			type: String,
			default: '0px'
		},
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
		cssVars() {
			return {
				'--rows': this.rows,
				'--columns': this.columns,
				'--header-height': this.headerHeight,
				'--controls-height': this.controlsHeight,
				'--ruler-size': this.rulerSize,
			}
		},
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
	--puzzle-info-height: 1.5rem;

	--unavail-height: calc(var(--header-height) + var(--controls-height) + var(--ruler-size) + var(--puzzle-info-height));
	--unavail-width: calc(var(--ruler-size));

	--vh98: calc(var(--vh-total) * 0.98);

	--grid-max-h: calc(var(--vh98) - var(--unavail-height));
	--grid-max-w: calc(100vw - 0.25rem - var(--unavail-width));

	--cell-max-h: calc(var(--grid-max-h) / var(--rows));
	--cell-max-w: calc(var(--grid-max-w) / var(--columns));

	--cell-padding: 0.5px;
}
.board {
	@apply grid relative mx-auto;
	grid-template-rows: var(--puzzle-info-height) var(--ruler-size) repeat(var(--rows), 1fr);
	grid-template-columns: var(--ruler-size) repeat(var(--columns), 1fr);
	gap: 1px;
	max-width: var(--grid-max-w);
	max-height: var(--grid-max-h);
	aspect-ratio: calc(var(--columns) / var(--rows));
}

.puzzle-info-wrapper {
	grid-row: 1 / span 1;
	grid-column: 1 / span calc(var(--columns) + 1);
	padding-left: var(--ruler-size);
	/* Flexbox with child min-width to keep center on overflow */
	@apply relative flex flex-row justify-center w-full items-start;
}

.new-board .cell {
	@apply bg-blue-300 text-xs overflow-hidden flex justify-center items-center bg-opacity-0 rounded-sm;	
	aspect-ratio: 1;
	min-height: 1rem;
	min-width: 1rem;
	width: 100%;
	height: 100%;
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